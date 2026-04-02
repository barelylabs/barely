import { zPost } from '@barely/utils';
import { z } from 'zod/v4';

import { libEnv } from '../../../env';

const SPOTIFY_AUTH_BASE = 'https://accounts.spotify.com';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

/**
 * Scopes required for pre-save functionality:
 * - user-library-modify: Save tracks to the fan's library
 * - user-read-email: Get the fan's email for fan list building
 */
const PRE_SAVE_SCOPES = ['user-library-modify', 'user-read-email'] as const;

/**
 * Build the Spotify authorization URL for a fan to grant pre-save permissions.
 * Uses the Authorization Code flow (NOT PKCE, since we have a server secret).
 */
export function buildSpotifyAuthUrl(params: { redirectUri: string; state: string }) {
	const searchParams = new URLSearchParams({
		response_type: 'code',
		client_id: libEnv.SPOTIFY_CLIENT_ID,
		scope: PRE_SAVE_SCOPES.join(' '),
		redirect_uri: params.redirectUri,
		state: params.state,
		show_dialog: 'true', // always show consent screen for fans
	});

	return `${SPOTIFY_AUTH_BASE}/authorize?${searchParams.toString()}`;
}

/**
 * Exchange an authorization code for access + refresh tokens.
 */
export async function exchangeSpotifyCode(params: { code: string; redirectUri: string }) {
	const auth = `Basic ${Buffer.from(
		`${libEnv.SPOTIFY_CLIENT_ID}:${libEnv.SPOTIFY_CLIENT_SECRET}`,
	).toString('base64')}`;

	const res = await zPost(`${SPOTIFY_AUTH_BASE}/api/token`, spotifyTokenResponseSchema, {
		contentType: 'application/x-www-form-urlencoded',
		body: {
			grant_type: 'authorization_code',
			code: params.code,
			redirect_uri: params.redirectUri,
		},
		auth,
	});

	if (!res.success || !res.parsed) {
		throw new Error('Failed to exchange Spotify authorization code for tokens');
	}

	return res.data;
}

/**
 * Refresh an expired fan Spotify access token.
 */
export async function refreshFanSpotifyToken(refreshToken: string) {
	const auth = `Basic ${Buffer.from(
		`${libEnv.SPOTIFY_CLIENT_ID}:${libEnv.SPOTIFY_CLIENT_SECRET}`,
	).toString('base64')}`;

	const res = await zPost(`${SPOTIFY_AUTH_BASE}/api/token`, spotifyTokenResponseSchema, {
		contentType: 'application/x-www-form-urlencoded',
		body: {
			grant_type: 'refresh_token',
			refresh_token: refreshToken,
		},
		auth,
	});

	if (!res.success || !res.parsed) {
		throw new Error('Failed to refresh fan Spotify access token');
	}

	return res.data;
}

/**
 * Get the fan's Spotify profile (email, display name, account ID).
 */
export async function getFanSpotifyProfile(accessToken: string) {
	const res = await fetch(`${SPOTIFY_API_BASE}/me`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});

	if (!res.ok) {
		throw new Error(`Failed to fetch Spotify profile: ${res.status}`);
	}

	const data = (await res.json()) as Record<string, unknown>;

	return {
		id: data.id as string,
		email: (data.email as string) ?? null,
		displayName: (data.display_name as string) ?? null,
	};
}

// schemas
const spotifyTokenResponseSchema = z.object({
	access_token: z.string(),
	token_type: z.string(),
	scope: z.string(),
	expires_in: z.number(), // seconds
	refresh_token: z.string().optional(),
});

export type SpotifyTokenResponse = z.infer<typeof spotifyTokenResponseSchema>;

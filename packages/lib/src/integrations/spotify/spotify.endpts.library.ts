import { z } from 'zod/v4';

import { spotifyPut } from './spotify-fetch';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

/**
 * Save items to a user's Spotify library.
 * Uses the new PUT /me/library endpoint (Feb 2026+).
 * Falls back to PUT /me/tracks for Extended Quota Mode apps.
 *
 * @see https://developer.spotify.com/documentation/web-api/reference/save-tracks-user
 * @scope user-library-modify
 */
export async function saveTracksToSpotifyLibrary(
	accessToken: string,
	spotifyTrackUris: string[],
) {
	// Max 40 items per request for new endpoint
	const batchSize = 40;
	const results: { success: boolean; error?: string }[] = [];

	for (let i = 0; i < spotifyTrackUris.length; i += batchSize) {
		const batch = spotifyTrackUris.slice(i, i + batchSize);

		// Try the new PUT /me/library endpoint first (Feb 2026+ Dev Mode)
		const res = await spotifyPut(
			`${SPOTIFY_API_BASE}/me/library?uris=${batch.join(',')}`,
			z.unknown(), // 200 OK with empty body on success
			{
				auth: `Bearer ${accessToken}`,
			},
		);

		if (!res.success) {
			// If 404 or method not found, fall back to legacy PUT /me/tracks
			if (res.status === 404 || res.status === 405) {
				const trackIds = batch
					.map(uri => uri.replace('spotify:track:', ''))
					.filter(id => !id.includes(':'));

				if (trackIds.length > 0) {
					const legacyRes = await spotifyPut(
						`${SPOTIFY_API_BASE}/me/tracks`,
						z.unknown(),
						{
							auth: `Bearer ${accessToken}`,
							body: { ids: trackIds },
						},
					);

					results.push({
						success: legacyRes.success,
						error:
							legacyRes.success ? undefined : (
								`Legacy endpoint failed: ${legacyRes.status}`
							),
					});
					continue;
				}
			}

			results.push({
				success: false,
				error: `Save to library failed: ${res.status}`,
			});
			continue;
		}

		results.push({ success: true });
	}

	return results;
}

/**
 * Convert a Spotify track ID to a Spotify URI.
 */
export function spotifyTrackIdToUri(trackId: string): string {
	if (trackId.startsWith('spotify:track:')) return trackId;
	return `spotify:track:${trackId}`;
}

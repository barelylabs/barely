import { z } from 'zod';

import env from '../../env';
import { zPost } from '../../utils/edge/zod-fetch';

//* ✨ ENDPOINTS ✨ *//

interface SpotifyRefreshTokenProps {
	refreshToken: string;
}

const refreshSpotifyAccessToken = async (props: SpotifyRefreshTokenProps) => {
	console.log('refreshing Spotify access token');

	const endpoint = 'https://accounts.spotify.com/api/token';
	const body = {
		grant_type: 'refresh_token',
		refresh_token: props.refreshToken,
	};

	const auth = `Basic ${Buffer.from(
		`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`,
	).toString('base64')}`;

	const tokenRes = await zPost({
		schema: spotifyRefreshTokenResponseSchema,
		contentType: 'application/x-www-form-urlencoded',
		endpoint,
		body,
		auth,
	});

	console.log('returned tokenRes => ', tokenRes);

	return tokenRes;
};

export { refreshSpotifyAccessToken };

//* 📓 SCHEMA 📓 *//

const spotifyRefreshTokenResponseSchema = z.object({
	access_token: z.string(),
	expires_in: z.number(), // time in seconds
	refresh_token: z.string().optional(),
});

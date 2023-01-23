//https://developer.spotify.com/documentation/ios/guides/token-swap-and-refresh/
import { zFetch } from '@barely/utils/edge';
import { z } from 'zod';

export const refreshAccessToken = async (refreshToken: string) => {
	const spotifyAuthBase64 =
		'Basic ' +
		Buffer.from(
			[process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_SECRET].join(':'),
		).toString('base64');

	const { json, error } = await zFetch.post({
		endpoint: `https://accounts.spotify.com/api/token`,
		contentType: 'application/x-www-form-urlencoded',
		authorization: spotifyAuthBase64,
		body: {
			grant_type: 'refresh_token',
			refresh_token: refreshToken,
		},
		schemaRes: spotifyRefreshAccessTokenSchema,
	});

	console.log('json => ', json);

	if (!json) throw new Error('No body returned from Spotify refresh access token.');
	if (error) throw new Error(error);

	const { access_token, expires_in } = json;

	console.log('access_token => ', access_token);
	console.log('expires_in => ', expires_in);
	const expires_at = Math.floor(Date.now() / 1000 + expires_in);

	return { access_token, expires_at };
};

const spotifyRefreshAccessTokenSchema = z.object({
	access_token: z.string(),
	expires_in: z.number(),
});

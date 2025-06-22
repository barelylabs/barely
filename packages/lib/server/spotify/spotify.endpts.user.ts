import { z } from 'zod/v4';

import { zGet } from '../../utils/zod-fetch';

//* ✨ ENDPOINTS ✨ *//

const getSpotifyUser = async (props: { accessToken: string }) => {
	const endpoint = 'https://api.spotify.com/v1/me';
	const auth = `Bearer ${props.accessToken}`;
	const userRes = await zGet(endpoint, spotifyUserResponseSchema, { auth });

	if (userRes.success && userRes.parsed) return userRes.data;

	throw new Error('Could not get spotify user');
};

export { getSpotifyUser };

//* 📓 SCHEMA 📓 *//

const spotifyUserResponseSchema = z.object({
	country: z.string().nullish(),
	display_name: z.string().nullable(),
	email: z.string().nullish(),
	external_urls: z.object({
		spotify: z.string(),
	}),
	followers: z.object({
		href: z.string().nullable(),
		total: z.number(),
	}),
	href: z.string(),
	id: z.string(),
	images: z.array(
		z.object({
			height: z.number().nullable(),
			url: z.string(),
			width: z.number().nullable(),
		}),
	),
	product: z.enum(['open', 'free', 'premium']).nullish(),
	type: z.enum(['user']),
	uri: z.string(),
});

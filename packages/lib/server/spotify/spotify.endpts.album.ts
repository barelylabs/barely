import { z } from 'zod';

import { log } from '../../utils/log';
import { zGet } from '../../utils/zod-fetch';

export async function getSpotifyAlbum(props: { accessToken: string; spotifyId: string }) {
	const endpoint = `https://api.spotify.com/v1/albums/${props.spotifyId}`;

	const auth = `Bearer ${props.accessToken}`;

	const res = await zGet(endpoint, spotifyAlbumResponseSchema, { auth });

	if (!res.success || !res.parsed) {
		await log({
			message: 'Failed to get Spotify album' + JSON.stringify(res),
			type: 'errors',
			location: 'getSpotifyAlbum',
			mention: true,
		});
		return null;
	}

	return res.data;
}

const spotifyAlbumResponseSchema = z.object({
	album_type: z.string(),
	artists: z.array(
		z.object({
			external_urls: z.object({
				spotify: z.string(),
			}),
			href: z.string(),
			id: z.string(),
			name: z.string(),
			type: z.string(),
			uri: z.string(),
		}),
	),
	available_markets: z.array(z.string()),
	external_urls: z.object({
		spotify: z.string(),
	}),
	href: z.string(),
	id: z.string(),
	images: z.array(
		z.object({
			url: z.string(),
			height: z.number().nullable(),
			width: z.number().nullable(),
		}),
	),
	name: z.string(),
	release_date: z.string(),
	release_date_precision: z.string(),
	total_tracks: z.number(),
	type: z.string(),
	uri: z.string(),
	tracks: z.object({
		items: z.array(
			z.object({
				artists: z.array(
					z.object({
						external_urls: z.object({
							spotify: z.string(),
						}),
						href: z.string(),
						id: z.string(),
						name: z.string(),
						type: z.string(),
						uri: z.string(),
					}),
				),
				available_markets: z.array(z.string()),
				disc_number: z.number(),
				duration_ms: z.number(),
				explicit: z.boolean(),
				external_urls: z.object({
					spotify: z.string(),
				}),
				href: z.string(),
				id: z.string(),
				is_local: z.boolean(),
				name: z.string(),
				preview_url: z.string().nullish(),
				track_number: z.number().nullish(),
				type: z.string(),
				uri: z.string(),
			}),
		),
	}),
});

export { spotifyAlbumResponseSchema };

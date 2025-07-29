import { zGet } from '@barely/utils';
import { z } from 'zod/v4';

import { log } from '../../utils/log';
import { spotifyRateLimiter } from './spotify.rate-limiter';

export async function getSpotifyAlbum(props: { accessToken: string; spotifyId: string }) {
	await spotifyRateLimiter.checkLimit();

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

export async function getSeveralSpotifyAlbums(props: {
	accessToken: string;
	albumIds: string[];
}) {
	const auth = `Bearer ${props.accessToken}`;
	const albums = [];

	// Process albumIds in chunks of 20
	for (let i = 0; i < props.albumIds.length; i += 20) {
		const chunk = props.albumIds.slice(i, i + 20);

		await spotifyRateLimiter.checkLimit();

		const endpoint = `https://api.spotify.com/v1/albums?ids=${chunk.join(',')}`;

		const res = await zGet(
			endpoint,
			z.object({
				albums: z.array(spotifyAlbumResponseSchema),
			}),
			{ auth },
		);

		if (!res.success || !res.parsed) {
			await log({
				message: `Failed to get Spotify albums chunk ${i / 20 + 1}: ${JSON.stringify(res)}`,
				type: 'errors',
				location: 'getSeveralSpotifyAlbums',
				mention: true,
			});
			continue;
		}

		albums.push(...res.data.albums);
	}

	return albums.length > 0 ? albums : null;
}

export const spotifyAlbumResponseSchema = z.object({
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
	popularity: z.number(),
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

import { zGet } from '@barely/utils';
import { z } from 'zod/v4';

import { log } from '../../utils/log';
import { getSeveralSpotifyAlbums } from './spotify.endpts.album';
import { spotifyRateLimiter } from './spotify.rate-limiter';

export async function getSpotifyArtist(props: {
	accessToken: string;
	spotifyId: string;
}) {
	await spotifyRateLimiter.checkLimit();

	const endpoint = `https://api.spotify.com/v1/artists/${props.spotifyId}`;

	const auth = `Bearer ${props.accessToken}`;

	const res = await zGet(endpoint, spotifyArtistResponseSchema, { auth });

	if (!res.success || !res.parsed) {
		await log({
			message: 'Failed to get Spotify artist' + JSON.stringify(res),
			type: 'errors',
			location: 'getSpotifyArtist',
			mention: true,
		});
		return null;
	}

	return res.data;
}

const spotifyArtistResponseSchema = z.object({
	external_urls: z.object({
		spotify: z.string(),
	}),
	followers: z.object({
		href: z.string().nullable(),
		total: z.number(),
	}),
	genres: z.array(z.string()),
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
	popularity: z.number(),
	type: z.string(),
	uri: z.string(),
});

export { spotifyArtistResponseSchema };

export async function getSpotifyArtistAlbums(props: {
	accessToken: string;
	spotifyId: string;
	needPopularity?: boolean;
	limit?: number;
}) {
	const auth = `Bearer ${props.accessToken}`;
	const allItems = [];
	let nextUrl: string | null =
		`https://api.spotify.com/v1/artists/${props.spotifyId}/albums?limit=${props.limit ?? 20}`;
	let responseData: z.infer<typeof spotifyArtistAlbumsResponseSchema> | null = null;

	// Fetch all pages of albums
	while (nextUrl) {
		await spotifyRateLimiter.checkLimit();
		const res = (await zGet(nextUrl, spotifyArtistAlbumsResponseSchema, { auth })) as {
			success: boolean;
			parsed: boolean;
			data: z.infer<typeof spotifyArtistAlbumsResponseSchema>;
		};

		if (!res.success || !res.parsed) {
			await log({
				message: 'Failed to get Spotify artist albums' + JSON.stringify(res),
				type: 'errors',
				location: 'getSpotifyArtistAlbums',
				mention: true,
			});
			return null;
		}

		responseData = res.data;
		allItems.push(...res.data.items);
		nextUrl = res.data.next;
	}

	if (!responseData) {
		return null;
	}

	if (!props.needPopularity) {
		return {
			...responseData,
			items: allItems,
			next: null,
			total: allItems.length,
		};
	}

	console.log('number of artist albums => ', allItems.length);

	const albumsWithPopularity = await getSeveralSpotifyAlbums({
		accessToken: props.accessToken,
		albumIds: allItems.map(album => album.id),
	});

	console.log('number of albums with popularity => ', albumsWithPopularity?.length);

	const items = allItems.map(album => {
		const albumWithPopularity = albumsWithPopularity?.find(a => a.id === album.id);
		return {
			...album,
			popularity: albumWithPopularity?.popularity,
		};
	});

	return {
		...responseData,
		items,
		next: null,
		total: items.length,
	};
}

export const spotifyArtistAlbumsResponseSchema = z.object({
	href: z.string(),
	items: z.array(
		z.object({
			album_type: z.string(),
			total_tracks: z.number(),
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
			type: z.string(),
			uri: z.string(),
			popularity: z.number().nullish(),
		}),
	),
	limit: z.number(),
	next: z.string().nullable(),
	offset: z.number(),
	previous: z.string().nullable(),
	total: z.number(),
});

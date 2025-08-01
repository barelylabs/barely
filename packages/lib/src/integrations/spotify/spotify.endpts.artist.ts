import { z } from 'zod/v4';

import { log } from '../../utils/log';
import { spotifyGet } from './spotify-fetch';
import { getSeveralSpotifyAlbums } from './spotify.endpts.album';
import { spotifyRateLimiter } from './spotify.rate-limiter';

export async function getSpotifyArtist(props: {
	accessToken: string;
	spotifyId: string;
}) {
	await spotifyRateLimiter.checkLimit();

	const endpoint = `https://api.spotify.com/v1/artists/${props.spotifyId}`;

	const auth = `Bearer ${props.accessToken}`;

	const res = await spotifyGet(endpoint, spotifyArtistResponseSchema, { auth });

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
	maxAlbums?: number; // Maximum total albums to fetch (default 100)
}) {
	const auth = `Bearer ${props.accessToken}`;
	const allItems = [];
	const maxAlbums = props.maxAlbums ?? 100; // Limit to 100 albums by default
	let nextUrl: string | null =
		`https://api.spotify.com/v1/artists/${props.spotifyId}/albums?limit=${props.limit ?? 20}`;
	let responseData: z.infer<typeof spotifyArtistAlbumsResponseSchema> | null = null;

	// Fetch pages of albums up to maxAlbums limit
	while (nextUrl && allItems.length < maxAlbums) {
		await spotifyRateLimiter.checkLimit();
		const res = (await spotifyGet(nextUrl, spotifyArtistAlbumsResponseSchema, {
			auth,
		})) as {
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

		// Add items up to the maxAlbums limit
		const remainingSpace = maxAlbums - allItems.length;
		const itemsToAdd = res.data.items.slice(0, remainingSpace);
		allItems.push(...itemsToAdd);

		// Stop if we've reached the limit
		if (allItems.length >= maxAlbums) {
			break;
		}

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

	const albumsWithPopularity = await getSeveralSpotifyAlbums({
		accessToken: props.accessToken,
		albumIds: allItems.map(album => album.id),
	});

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

import { z } from 'zod';

import { log } from '../../utils/log';
import { zGet } from '../../utils/zod-fetch';
import { getSeveralSpotifyAlbums } from './spotify.endpts.album';

export async function getSpotifyArtist(props: {
	accessToken: string;
	spotifyId: string;
}) {
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

export const spotifyArtistResponseSchema = z.object({
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

export async function getSpotifyArtistAlbums(props: {
	accessToken: string;
	spotifyId: string;
	needPopularity?: boolean;
}) {
	const endpoint = `https://api.spotify.com/v1/artists/${props.spotifyId}/albums`;

	const auth = `Bearer ${props.accessToken}`;

	const res = await zGet(endpoint, spotifyArtistAlbumsResponseSchema, { auth });

	if (!res.success || !res.parsed) {
		await log({
			message: 'Failed to get Spotify artist albums' + JSON.stringify(res),
			type: 'errors',
			location: 'getSpotifyArtistAlbums',
			mention: true,
		});
		return null;
	}

	if (!props.needPopularity) {
		return res.data;
	}

	const albumsWithPopularity = await getSeveralSpotifyAlbums({
		accessToken: props.accessToken,
		albumIds: res.data.items.map(album => album.id),
	});

	const items = res.data.items.map(album => {
		const albumWithPopularity = albumsWithPopularity?.find(a => a.id === album.id);
		return {
			...album,
			popularity: albumWithPopularity?.popularity,
		};
	});

	return {
		...res.data,
		items,
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

// get artist albums

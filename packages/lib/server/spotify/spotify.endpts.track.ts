import { z } from 'zod';

import { log } from '../../utils/log';
import { zGet } from '../../utils/zod-fetch';

export async function getSpotifyTrack(props: { accessToken: string; spotifyId: string }) {
	const endpoint = `https://api.spotify.com/v1/tracks/${props.spotifyId}`;

	const auth = `Bearer ${props.accessToken}`;

	const res = await zGet(endpoint, spotifyTrackResponseSchema, {
		auth,
		logResponse: true,
	});

	console.log('res => ', res);

	if (!res.success || !res.parsed) {
		await log({
			message: 'Failed to get Spotify track' + JSON.stringify(res),
			type: 'errors',
			location: 'getSpotifyTrack',
			mention: true,
		});
		return null;
	}

	return res.data;
}

const spotifyTrackResponseSchema = z.object({
	album: z.object({
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
	}),
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
	external_ids: z.object({
		isrc: z.string(),
	}),
	external_urls: z.object({
		spotify: z.string(),
	}),
	href: z.string(),
	id: z.string(),
	is_local: z.boolean(),
	name: z.string(),
	popularity: z.number(),
	preview_url: z.string().nullish(),
	track_number: z.number().nullish(),
});

export { spotifyTrackResponseSchema };

export async function getSpotifyTracksByAlbum(props: {
	accessToken: string;
	albumId: string;
	limit?: number;
}) {
	const auth = `Bearer ${props.accessToken}`;
	const allItems = [];
	let nextUrl: string | null =
		`https://api.spotify.com/v1/albums/${props.albumId}/tracks?limit=${props.limit ?? 25}`;

	// Fetch all pages of tracks
	while (nextUrl) {
		const res = (await zGet(nextUrl, spotifyAlbumTracksResponseSchema, { auth })) as {
			success: boolean;
			parsed: boolean;
			data: z.infer<typeof spotifyAlbumTracksResponseSchema>;
		};

		if (!res.success || !res.parsed) {
			await log({
				message: 'Failed to get Spotify album tracks' + JSON.stringify(res),
				type: 'errors',
				location: 'getSpotifyTracksByAlbum',
				mention: true,
			});
			return null;
		}

		allItems.push(...res.data.items);
		nextUrl = res.data.next;
	}

	// Get full track details for all tracks in chunks of 20
	const tracks = [];
	for (let i = 0; i < allItems.length; i += 20) {
		const chunk = allItems.slice(i, i + 20);
		const trackIds = chunk.map(track => track.id);
		const tracksEndpoint = `https://api.spotify.com/v1/tracks?ids=${trackIds.join(',')}`;

		const tracksRes = await zGet(
			tracksEndpoint,
			z.object({
				tracks: z.array(spotifyTrackResponseSchema),
			}),
			{ auth },
		);

		if (!tracksRes.success || !tracksRes.parsed) {
			await log({
				message: 'Failed to get full Spotify track details' + JSON.stringify(tracksRes),
				type: 'errors',
				location: 'getSpotifyTracksByAlbum',
				mention: true,
			});
			continue;
		}

		tracks.push(...tracksRes.data.tracks);
	}

	if (tracks.length === 0) {
		return null;
	}

	// Return in the same format as before
	return {
		href: `https://api.spotify.com/v1/albums/${props.albumId}/tracks`,
		items: tracks,
		limit: props.limit ?? 20,
		next: null,
		offset: 0,
		previous: null,
		total: tracks.length,
	};
}

export const spotifyAlbumTracksResponseSchema = z.object({
	href: z.string(),
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
			preview_url: z.string().nullable(),
			track_number: z.number(),
			type: z.string(),
			uri: z.string(),
		}),
	),
	limit: z.number(),
	next: z.string().nullable(),
	offset: z.number(),
	previous: z.string().nullable(),
	total: z.number(),
});

export async function getSeveralSpotifyTracks(props: {
	accessToken: string;
	trackIds: string[];
}) {
	const auth = `Bearer ${props.accessToken}`;
	const tracks = [];

	// Process trackIds in chunks of 50
	for (let i = 0; i < props.trackIds.length; i += 50) {
		const chunk = props.trackIds.slice(i, i + 50);
		const endpoint = `https://api.spotify.com/v1/tracks?ids=${chunk.join(',')}`;

		const res = await zGet(
			endpoint,
			z.object({
				tracks: z.array(spotifyTrackResponseSchema),
			}),
			{ auth },
		);

		if (!res.success || !res.parsed) {
			await log({
				message: `Failed to get Spotify tracks chunk ${i / 50 + 1}: ${JSON.stringify(res)}`,
				type: 'errors',
				location: 'getSeveralSpotifyTracks',
				mention: true,
			});
			continue;
		}

		tracks.push(...res.data.tracks);
	}

	return tracks.length > 0 ? tracks : null;
}

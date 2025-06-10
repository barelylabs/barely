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
	// needPopularity?: boolean;
}) {
	const endpoint = `https://api.spotify.com/v1/albums/${props.albumId}/tracks`;

	const auth = `Bearer ${props.accessToken}`;

	const res = await zGet(endpoint, spotifyAlbumTracksResponseSchema, { auth });

	if (!res.success || !res.parsed) {
		await log({
			message: 'Failed to get Spotify album tracks' + JSON.stringify(res),
			type: 'errors',
			location: 'getSpotifyTracksByAlbum',
			mention: true,
		});
		return null;
	}

	// Get full track details for all tracks
	const trackIds = res.data.items.map(track => track.id);
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
		return null;
	}

	return {
		...res.data,
		items: tracksRes.data.tracks,
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
	const endpoint = `https://api.spotify.com/v1/tracks?ids=${props.trackIds.join(',')}`;

	const auth = `Bearer ${props.accessToken}`;

	const res = await zGet(
		endpoint,
		z.object({
			tracks: z.array(spotifyTrackResponseSchema),
		}),
		{ auth },
	);

	if (!res.success || !res.parsed) {
		await log({
			message: 'Failed to get several Spotify tracks' + JSON.stringify(res),
			type: 'errors',
			location: 'getSeveralSpotifyTracks',
			mention: true,
		});
		return null;
	}

	return res.data.tracks;
}

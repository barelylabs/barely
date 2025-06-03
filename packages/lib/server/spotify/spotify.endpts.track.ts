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

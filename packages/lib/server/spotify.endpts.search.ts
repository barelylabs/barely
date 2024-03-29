import { z } from 'zod';

import { zGet } from '../utils/zod-fetch';

//* ✨ ENDPOINTS ✨ *//

interface SpotifySearchProps {
	accessToken: string;
	query: string;
	types?: ('artist' | 'album' | 'track' | 'playlist')[];
	limit?: number;
}

const searchSpotify = async (props: SpotifySearchProps) => {
	// console.log('searching spotify');
	const query = props.query;
	const types = props.types ? props.types.join(',') : '';
	const limit = props.limit ?? 20;

	const endpoint = `https://api.spotify.com/v1/search?q=${query}&type=${types}&limit=${limit}`;
	const auth = `Bearer ${props.accessToken}`;

	const searchResponse = await zGet(endpoint, spotifySearchResponseSchema, {
		auth,
	});

	if (!searchResponse.success) throw new Error('Error searching Spotify.');
	if (!searchResponse.parsed) throw new Error('Error parsing Spotify search response.');

	return searchResponse.data;
};

export { searchSpotify };

//* 📓 SCHEMA 📓 *//

const spotifyErrorSchema = z.object({
	error: z.object({
		status: z.number(),
		message: z.string(),
	}),
});

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
				height: z.number(),
				url: z.string(),
				width: z.number(),
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
	preview_url: z.string().nullable(),
	track_number: z.number(),
	type: z.string(),
	uri: z.string(),
});

const spotifySearchResponseSchema = z.object({
	tracks: z
		.object({
			href: z.string(),
			items: spotifyTrackResponseSchema.array(),
			limit: z.number(),
			next: z.string().nullable(),
			offset: z.number(),
			previous: z.string().nullable(),
			total: z.number(),
		})
		.optional(),
	error: spotifyErrorSchema.optional(),
});

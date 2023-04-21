import { z } from 'zod';

import { Team, Track } from '@barely/db';

const trackSchema = z.object({
	id: z.string(),
	name: z.string(),
	teamId: z.string(),

	imageUrl: z.string().nullish(),
	masterMp3Id: z.string().nullish(),
	masterMp3Url: z.string().nullish(),
	isrc: z.string().nullish(),

	appleMusicId: z.string().nullish(),
	appleMusicLinkId: z.string().nullish(),
	deezerId: z.string().nullish(),
	deezerLinkId: z.string().nullish(),
	soundcloudId: z.string().nullish(),
	soundcloudLinkId: z.string().nullish(),
	spotifyId: z.string().nullish(),
	spotifyLinkId: z.string().nullish(),
	tidalId: z.string().nullish(),
	tidalLinkId: z.string().nullish(),
	youtubeId: z.string().nullish(),
	youtubeLinkId: z.string().nullish(),

	released: z.boolean(),
	releaseDate: z.date().nullish(),
});

const trackUpdateSchema = trackSchema
	.partial({ name: true, teamId: true, spotifyId: true, released: true })
	.extend({
		genreNames: z.array(z.string()).optional(),
	});

interface TrackWithArtist extends Track {
	artist: Omit<Team, 'createdAt'>;
}

interface TrackWithArtistAndGenres extends TrackWithArtist {
	genres: string[];
}

export { trackSchema, trackUpdateSchema };
export type { TrackWithArtist, TrackWithArtistAndGenres };

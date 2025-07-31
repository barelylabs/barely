import type {
	_Files_To_Tracks__Artwork,
	_Files_To_Tracks__Audio,
	SpotifyLinkedTracks,
} from '@barely/db/sql';
import type { InferSelectModel } from 'drizzle-orm';
import { WORKSPACE_TIMEZONES } from '@barely/const';
import { Tracks } from '@barely/db/sql';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod/v4';

import type { Album } from './album.schema';
import type { FileRecord, PublicAudio, PublicImage } from './file.schema';
import type { Genre } from './genre.schema';
import type { PublicWorkspace, Workspace } from './workspace.schema';
import {
	queryBooleanSchema,
	querySelectionSchema,
	queryStringArraySchema,
	sortOrderSchema,
} from '../helpers';
import { genreIdSchema } from './genre.schema';
import { statDateRange } from './stat.schema';

const insertTrackAudioFilesSchema = z.array(
	z.object({
		fileId: z.string(),
		masterCompressed: z.boolean().optional(),
		masterWav: z.boolean().optional(),
		instrumentalCompressed: z.boolean().optional(),
		instrumentalWav: z.boolean().optional(),
		stem: z.boolean().optional(),
	}),
);

export type InsertTrackAudioFile = z.infer<typeof insertTrackAudioFilesSchema>[number];

export const insertTrackArtworkFilesSchema = z.array(
	z.object({
		fileId: z.string(),
		current: z.boolean().optional(),
	}),
);

export type InsertTrackArtworkFile = z.infer<
	typeof insertTrackArtworkFilesSchema
>[number];

export const insertTrackSchema = createInsertSchema(Tracks, {
	name: name => name.min(1, 'Name is required').max(255, 'Name is too long'),
	isrc: isrc => isrc.transform(v => (!v.length ? null : v)),
	appleMusicId: appleMusicId => appleMusicId.transform(v => (!v.length ? null : v)),
	deezerId: deezerId => deezerId.transform(v => (!v.length ? null : v)),
	soundcloudId: soundcloudId => soundcloudId.transform(v => (!v.length ? null : v)),
	// spotifyId: spotifyId => spotifyId.transform(v => (!v?.length ? null : v)),
	tidalId: tidalId => tidalId.transform(v => (!v.length ? null : v)),
	youtubeId: youtubeId => youtubeId.transform(v => (!v.length ? null : v)),
	releaseDate: releaseDate => releaseDate.transform(v => (!v.length ? null : v)),
}).extend({
	_genres: z.array(genreIdSchema).optional(),
	_artworkFiles: insertTrackArtworkFilesSchema.optional(),
	_audioFiles: insertTrackAudioFilesSchema.optional(),
});

export const createTrackSchema = insertTrackSchema.omit({
	id: true,
	workspaceId: true,
});
export const upsertTrackSchema = insertTrackSchema.partial({
	id: true,
	workspaceId: true,
});
export const updateTrackSchema = insertTrackSchema.partial().required({ id: true });

export const selectTrackSchema = createSelectSchema(Tracks);

export type Track = z.infer<typeof selectTrackSchema>;
export type InsertTrack = z.infer<typeof insertTrackSchema>;
export type CreateTrack = z.infer<typeof createTrackSchema>;
export type UpsertTrack = z.infer<typeof upsertTrackSchema>;
export type UpdateTrack = z.infer<typeof updateTrackSchema>;

// forms
export const defaultTrack: UpsertTrack = {
	name: '',
	isrc: '',

	appleMusicId: '',
	deezerId: '',
	soundcloudId: '',
	// spotifyId: '',
	tidalId: '',
	youtubeId: '',

	released: false,
	releaseDate: '',

	_genres: [],
	_artworkFiles: [],
	_audioFiles: [],
} as const;

export const formatWorkspaceTrackToUpsertTrackForm = (
	track: TrackWith_Workspace_Genres_Files,
) => {
	return {
		...track,
		isrc: track.isrc ?? '',
		appleMusicId: track.appleMusicId ?? '',
		deezerId: track.deezerId ?? '',
		soundcloudId: track.soundcloudId ?? '',
		// spotifyId: track.spotifyId ?? '',
		tidalId: track.tidalId ?? '',
		youtubeId: track.youtubeId ?? '',
		releaseDate: track.releaseDate ?? '',
	} satisfies TrackWith_Workspace_Genres_Files;
};

// queries
type TrackArtworkFile = Omit<
	InferSelectModel<typeof _Files_To_Tracks__Artwork>,
	'fileId' | 'trackId'
> &
	FileRecord;
type TrackAudioFile = Omit<
	InferSelectModel<typeof _Files_To_Tracks__Audio>,
	'fileId' | 'trackId'
> &
	FileRecord;

export type SpotifyLinkedTrack = InferSelectModel<typeof SpotifyLinkedTracks>;

export interface TrackWith_Workspace_Genres_Files extends Track {
	workspace: Workspace;
	genres: Genre[];

	artworkFiles?: TrackArtworkFile[];
	audioFiles?: TrackAudioFile[];
	spotifyLinkedTracks?: SpotifyLinkedTrack[];
	_albums?: { album: Album; trackNumber: number }[];
}

// public
export type PublicTrack = Pick<Track, 'id' | 'name' | 'isrc' | 'releaseDate'> & {
	artworkUrl?: string;
	audioUrl?: string;
};

export interface PublicTrackWith_Artist_Files extends PublicTrack {
	workspace: PublicWorkspace;
	artwork?: PublicImage;
	audioFiles: PublicAudio[];
}

// query params
const sortByValues = ['name', 'spotifyPopularity', 'releaseDate'] as const;
export type TrackSortBy = (typeof sortByValues)[number];

export const sortByOptions = [
	{ label: 'Name', value: 'name' as TrackSortBy, icon: 'sortAscending' as const },
	{
		label: 'Spotify Popularity',
		value: 'spotifyPopularity' as TrackSortBy,
		icon: 'sortDescending' as const,
	},
	{
		label: 'Release Date',
		value: 'releaseDate' as TrackSortBy,
		icon: 'sortDescending' as const,
	},
];

export const trackFilterParamsSchema = z.object({
	search: z.string().optional().default(''),
	genres: queryStringArraySchema.optional().default([]),
	showArchived: queryBooleanSchema.optional().default(false),
	showDeleted: queryBooleanSchema.optional().default(false),
	released: queryBooleanSchema.optional().default(false),
	sortBy: z.enum(sortByValues).optional(),
	sortOrder: sortOrderSchema.optional(),
});

export const trackSearchParamsSchema = trackFilterParamsSchema.extend({
	selectedTrackIds: querySelectionSchema.optional(),
});

export const selectWorkspaceTracksSchema = trackFilterParamsSchema.extend({
	handle: z.string(),
	cursor: z
		.object({
			id: z.string(),
			createdAt: z.coerce.date(),
			spotifyPopularity: z.number().nullable(),
		})
		.optional(),
	limit: z.coerce.number().min(1).max(100).optional().default(20),
});

// stat filters
export const trackStatFiltersSchema = z.object({
	trackId: z.string().optional(), // Keep for backward compatibility
	trackIds: z.array(z.string()).optional(), // New array support
	dateRange: statDateRange.optional(),
	start: z.string().optional(),
	end: z.string().optional(),
	timezone: z.enum(WORKSPACE_TIMEZONES).optional(),
	showPopularity: queryBooleanSchema.optional().default(true),
});

export type TrackStatFilters = z.infer<typeof trackStatFiltersSchema>;

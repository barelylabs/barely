import { relations } from 'drizzle-orm';
import {
	date,
	index,
	integer,
	pgTable,
	primaryKey,
	uniqueIndex,
	varchar,
} from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../utils';
import { Tracks } from './track.sql';
import { Workspaces } from './workspace.sql';

export const Albums = pgTable(
	'Albums',
	{
		...primaryId,
		workspaceId: dbId('workspaceId')
			.notNull()
			.references(() => Workspaces.id, {
				onDelete: 'cascade',
			}),

		...timestamps,

		name: varchar('name', { length: 255 }).notNull(),
		totalTracks: integer('totalTracks').notNull(),
		imageUrl: varchar('imageUrl', { length: 255 }),
		releaseDate: date('releaseDate', { mode: 'string' }),

		// DSP IDs
		appleMusicId: varchar('appleMusicId', { length: 255 }).unique(),
		deezerId: varchar('deezerId', { length: 255 }).unique(),
		soundcloudId: varchar('soundcloudId', { length: 255 }).unique(),
		spotifyId: varchar('spotifyId', { length: 255 }).unique(),
		tidalId: varchar('tidalId', { length: 255 }).unique(),
		youtubeId: varchar('youtubeId', { length: 255 }).unique(),

		spotifyPopularity: integer('spotifyPopularity'),
		spotifyStreams: integer('spotifyStreams'),

		// // DSP Link IDs
		// appleMusicLinkId: varchar('appleMusicLinkId', { length: 255 }).unique(),
		// deezerLinkId: varchar('deezerLinkId', { length: 255 }).unique(),
		// soundcloudLinkId: varchar('soundcloudLinkId', { length: 255 }).unique(),
		// spotifyLinkId: varchar('spotifyLinkId', { length: 255 }).unique(),
		// tidalLinkId: varchar('tidalLinkId', { length: 255 }).unique(),
		// youtubeLinkId: varchar('youtubeLinkId', { length: 255 }).unique(),
	},
	album => ({
		workspace: index('Albums_workspaceId_key').on(album.workspaceId),
		workspace_albumName: uniqueIndex('Albums_workspace_albumName_key').on(
			album.workspaceId,
			album.name,
		),
	}),
);

export const Album_Relations = relations(Albums, ({ one, many }) => ({
	workspace: one(Workspaces, {
		fields: [Albums.workspaceId],
		references: [Workspaces.id],
	}),
	tracks: many(_Albums_To_Tracks),
}));

// Join table for Albums to Tracks
export const _Albums_To_Tracks = pgTable(
	'_Albums_To_Tracks',
	{
		albumId: dbId('albumId')
			.notNull()
			.references(() => Albums.id, { onDelete: 'cascade' }),
		trackId: dbId('trackId')
			.notNull()
			.references(() => Tracks.id, { onDelete: 'cascade' }),
		trackNumber: integer('trackNumber').notNull(),
	},
	table => ({
		pk: primaryKey({ columns: [table.albumId, table.trackId] }),
	}),
);

export const _Albums_To_Tracks_Relations = relations(_Albums_To_Tracks, ({ one }) => ({
	album: one(Albums, {
		fields: [_Albums_To_Tracks.albumId],
		references: [Albums.id],
	}),
	track: one(Tracks, {
		fields: [_Albums_To_Tracks.trackId],
		references: [Tracks.id],
	}),
}));

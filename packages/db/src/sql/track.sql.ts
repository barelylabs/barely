import { relations } from 'drizzle-orm';
import { boolean, date, index, pgTable, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../utils';
import { Campaigns } from './campaign.sql';
import { _Files_To_Tracks__Artwork, _Files_To_Tracks__Audio } from './file.sql';
import { _Tracks_To_Genres } from './genre.sql';
import { _Mixtapes_To_Tracks } from './mixtape.sql';
import { PlaylistPlacements } from './playlist-placement.sql';
import { _Playlists_To_Tracks } from './playlist.sql';
import { Stats } from './stat.sql';
import { TrackRenders } from './track-render.sql';
import { Workspaces } from './workspace.sql';

export const Tracks = pgTable(
	'Tracks',
	{
		...primaryId,
		workspaceId: dbId('workspaceId')
			.notNull()
			.references(() => Workspaces.id, {
				onDelete: 'cascade',
			}),

		...timestamps,

		name: varchar('name', { length: 255 }).notNull(),
		isrc: varchar('isrc', { length: 255 }).unique(),

		appleMusicId: varchar('appleMusicId', { length: 255 }).unique(),
		deezerId: varchar('deezerId', { length: 255 }).unique(),
		soundcloudId: varchar('soundcloudId', { length: 255 }).unique(),
		spotifyId: varchar('spotifyId', { length: 255 }).unique(),
		tidalId: varchar('tidalId', { length: 255 }).unique(),
		youtubeId: varchar('youtubeId', { length: 255 }).unique(),
		released: boolean('released').notNull(),

		releaseDate: date('releaseDate', { mode: 'string' }),
		imageUrl: varchar('imageUrl', { length: 255 }),

		archived: boolean('archived').default(false),
		// relations
		masterMp3Id: varchar('masterMp3Id', { length: 255 }).unique(),
		masterWavId: varchar('masterWavId', { length: 255 }).unique(),
		artworkId: dbId('artworkId'),

		appleMusicLinkId: varchar('appleMusicLinkId', { length: 255 }).unique(),
		deezerLinkId: varchar('deezerLinkId', { length: 255 }).unique(),
		soundcloudLinkId: varchar('soundcloudLinkId', { length: 255 }).unique(),
		spotifyLinkId: varchar('spotifyLinkId', { length: 255 }).unique(),
		tidalLinkId: varchar('tidalLinkId', { length: 255 }).unique(),
		youtubeLinkId: varchar('youtubeLinkId', { length: 255 }).unique(),
	},
	track => ({
		workspace: index('Tracks_workspaceId_key').on(track.workspaceId),
		workspace_trackName: uniqueIndex('Tracks_workspace_trackName_key').on(
			track.workspaceId,
			track.name,
		),
	}),
);

export const Track_Relations = relations(Tracks, ({ one, many }) => ({
	// one-to-many
	workspace: one(Workspaces, {
		fields: [Tracks.workspaceId],
		references: [Workspaces.id],
	}),
	// many-to-one
	campaigns: many(Campaigns),
	playlistPlacements: many(PlaylistPlacements),
	stats: many(Stats),
	trackRenders: many(TrackRenders),
	_audioFiles: many(_Files_To_Tracks__Audio),
	_artworkFiles: many(_Files_To_Tracks__Artwork),

	// many-to-many
	playlists: many(_Playlists_To_Tracks),
	_mixtapes: many(_Mixtapes_To_Tracks),
	_genres: many(_Tracks_To_Genres),
}));

import { relations } from 'drizzle-orm';
import { boolean, index, integer, pgTable, timestamp } from 'drizzle-orm/pg-core';

import { dbId, primaryId, sqlCurrentTimestamp, timestamps } from '../utils/sql';
import { PlaylistPitchReviews } from './playlist-pitch-review.sql';
import { Playlists } from './playlist.sql';
import { Tracks } from './track.sql';

export const PlaylistPlacements = pgTable(
	'PlaylistPlacements',
	{
		...primaryId,
		...timestamps,

		addedToPlaylist: boolean('addedToPlaylist').default(false).notNull(),
		playlistPosition: integer('playlistPosition').notNull(),
		addDate: timestamp('addDate', { mode: 'string' }).default(sqlCurrentTimestamp),
		daysInPlaylist: integer('daysInPlaylist'),
		removeDate: timestamp('removeDate', { mode: 'string' }),
		removedFromPlaylist: boolean('removedFromPlaylist').default(false).notNull(),

		// relations

		trackId: dbId('trackId')
			.notNull()
			.references(() => Tracks.id),

		playlistId: dbId('playlistId')
			.notNull()
			.references(() => Playlists.id),

		pitchReviewId: dbId('pitchReviewId'),
	},
	placement => {
		return {
			pitchReview: index('PlaylistPlacements_pitchReview_idx').on(
				placement.pitchReviewId,
			),

			// track: foreignKey({
			// 	columns: [placement.trackWorkspaceId, placement.trackId],
			// 	foreignColumns: [Tracks.workspaceId, Tracks.id],
			// }),

			// playlist: foreignKey({
			// 	columns: [placement.playlistWorkspaceId, placement.playlistId],
			// 	foreignColumns: [Playlists.workspaceId, Playlists.id],
			// }),
		};
	},
);

export const PlaylistPlacement_Relations = relations(PlaylistPlacements, ({ one }) => ({
	// one-to-many
	track: one(Tracks, {
		fields: [PlaylistPlacements.trackId],
		references: [Tracks.id],
	}),
	pitchReview: one(PlaylistPitchReviews, {
		fields: [PlaylistPlacements.pitchReviewId],
		references: [PlaylistPitchReviews.id],
	}),
	playlist: one(Playlists, {
		fields: [PlaylistPlacements.playlistId],
		references: [Playlists.id],
	}),
}));

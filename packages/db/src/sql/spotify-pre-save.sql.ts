import { relations } from 'drizzle-orm';
import {
	boolean,
	index,
	integer,
	pgTable,
	timestamp,
	uniqueIndex,
	varchar,
} from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../utils';
import { Fans } from './fan.sql';
import { FmPages } from './fm.sql';
import { Tracks } from './track.sql';
import { Workspaces } from './workspace.sql';

/**
 * Stores a fan's pre-save intent for a track.
 * Each record represents one fan wanting to save one track to their Spotify library on release day.
 */
export const SpotifyPreSaves = pgTable(
	'SpotifyPreSaves',
	{
		...primaryId,
		...timestamps,

		workspaceId: dbId('workspaceId')
			.notNull()
			.references(() => Workspaces.id, { onDelete: 'cascade' }),

		// the track to be saved
		trackId: dbId('trackId')
			.notNull()
			.references(() => Tracks.id, { onDelete: 'cascade' }),

		// the fan who pre-saved (nullable - set after email capture)
		fanId: dbId('fanId').references(() => Fans.id, { onDelete: 'set null' }),

		// the FM page where the pre-save originated
		fmPageId: dbId('fmPageId').references(() => FmPages.id, { onDelete: 'set null' }),

		// Spotify OAuth tokens for this fan (stored here, not in ProviderAccounts,
		// because fans are NOT workspace users)
		spotifyAccountId: varchar('spotifyAccountId', { length: 255 }).notNull(),
		spotifyEmail: varchar('spotifyEmail', { length: 255 }),
		spotifyAccessToken: varchar('spotifyAccessToken', { length: 2000 }).notNull(),
		spotifyRefreshToken: varchar('spotifyRefreshToken', { length: 2000 }).notNull(),
		spotifyTokenExpiresAt: integer('spotifyTokenExpiresAt').notNull(), // unix timestamp in seconds
		spotifyTokenScope: varchar('spotifyTokenScope', { length: 2000 }),

		// fulfillment status
		fulfilledAt: timestamp('fulfilledAt'),
		fulfillmentError: varchar('fulfillmentError', { length: 1000 }),

		// email notification (Phase 1)
		notificationSentAt: timestamp('notificationSentAt'),

		// timezone for midnight release
		timezone: varchar('timezone', { length: 100 }),

		// opt-in flags
		emailMarketingOptIn: boolean('emailMarketingOptIn').default(false).notNull(),
	},
	preSave => ({
		workspace: index('SpotifyPreSaves_workspace_idx').on(preSave.workspaceId),
		track: index('SpotifyPreSaves_track_idx').on(preSave.trackId),
		fmPage: index('SpotifyPreSaves_fmPage_idx').on(preSave.fmPageId),
		// one pre-save per Spotify account per track
		uniqueSpotifyTrack: uniqueIndex('SpotifyPreSaves_spotifyAccount_track_idx').on(
			preSave.spotifyAccountId,
			preSave.trackId,
		),
	}),
);

export const SpotifyPreSave_Relations = relations(SpotifyPreSaves, ({ one }) => ({
	workspace: one(Workspaces, {
		fields: [SpotifyPreSaves.workspaceId],
		references: [Workspaces.id],
	}),
	track: one(Tracks, {
		fields: [SpotifyPreSaves.trackId],
		references: [Tracks.id],
	}),
	fan: one(Fans, {
		fields: [SpotifyPreSaves.fanId],
		references: [Fans.id],
	}),
	fmPage: one(FmPages, {
		fields: [SpotifyPreSaves.fmPageId],
		references: [FmPages.id],
	}),
}));

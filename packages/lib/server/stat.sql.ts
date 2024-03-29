import { relations } from 'drizzle-orm';
import { index, integer, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../utils/sql';
import { Ads } from './ad.sql';
import { Playlists } from './playlist.sql';
import { ProviderAccounts } from './provider-account.sql';
import { Tracks } from './track.sql';

const providersEnum = ['discord', 'facebook', 'google', 'spotify', 'tiktok'] as const;

// this should probably move to clickhouse

export const Stats = pgTable(
	'Stats',
	{
		...primaryId,
		...timestamps,

		date: timestamp('date', { mode: 'string' }).notNull(),
		listeners: integer('listeners'),
		streams: integer('streams'),
		likes: integer('likes'),
		saves: integer('saves'),
		followers: integer('followers'),
		newFollowers: integer('newFollowers'),
		spend: integer('spend'),
		clicks: integer('clicks'),
		impressions: integer('impressions'),
		views: integer('views'),
		watch25: integer('watch25'),
		watch50: integer('watch50'),
		watch75: integer('watch75'),
		watch95: integer('watch95'),
		watch100: integer('watch100'),
		watch60S: integer('watch60s'),
		platform: varchar('platform', {
			length: 255,
			enum: ['appleMusic', 'meta', 'spotify', 'youtube'],
		}),

		// relations
		adId: dbId('adId'),
		providerAccountProvider: varchar('providerAccountPlatform', {
			length: 255,
			enum: providersEnum,
		}),
		providerAccountId: varchar('providerAccountId', { length: 255 }),
		playlistId: dbId('playlistId').references(() => Playlists.id),
		trackId: dbId('trackId').references(() => Tracks.id),
	},
	stat => ({
		adIdIdx: index('Stat_adId_idx').on(stat.adId),
		accountIdIdx: index('Stat_accountId_idx').on(stat.providerAccountId),
		playlistIdIdx: index('Stat_playlistId_idx').on(stat.playlistId),
		trackIdIdx: index('Stat_trackId_idx').on(stat.trackId),
	}),
);

export const Stat_Relations = relations(Stats, ({ one }) => ({
	// one-to-many
	ad: one(Ads, {
		fields: [Stats.adId],
		references: [Ads.id],
	}),
	providerAccount: one(ProviderAccounts, {
		fields: [Stats.providerAccountProvider, Stats.providerAccountId],
		references: [ProviderAccounts.provider, ProviderAccounts.providerAccountId],
	}),
	playlist: one(Playlists, {
		fields: [Stats.playlistId],
		references: [Playlists.id],
	}),
	track: one(Tracks, {
		fields: [Stats.trackId],
		references: [Tracks.id],
	}),
}));

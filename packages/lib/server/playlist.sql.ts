import { relations } from 'drizzle-orm';
import {
	boolean,
	index,
	integer,
	jsonb,
	pgTable,
	primaryKey,
	varchar,
} from 'drizzle-orm/pg-core';

import { cuid, primaryId, timestamps } from '../utils/sql';
import { Campaigns } from './campaign.sql';
import { Files } from './file.sql';
import { _Playlists_To_Genres } from './genre.sql';
import { Links } from './link.sql';
import { PlaylistPlacements } from './playlist-placement.sql';
import { ProviderAccounts } from './provider-account.sql';
import { Stats } from './stat.sql';
import { Users } from './user.sql';
import { Workspaces } from './workspace.sql';

export const Playlists = pgTable(
	'Playlists',
	{
		...primaryId,
		workspaceId: cuid('workspaceId')
			.notNull()
			.references(() => Workspaces.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade',
			}),

		...timestamps,

		// platforms
		appleMusicId: varchar('appleMusicId', { length: 255 }),
		deezerId: varchar('deezerId', { length: 255 }),
		soundCloudId: varchar('soundCloudId', { length: 255 }),
		spotifyId: varchar('spotifyId', { length: 255 }).unique(),
		tidalId: varchar('tidalId', { length: 255 }),
		youtubeId: varchar('youtubeId', { length: 255 }),

		name: varchar('name', { length: 255 }).notNull(),
		description: varchar('description', { length: 255 }),
		public: boolean('public').notNull(),
		userOwned: boolean('userOwned').notNull(),
		totalTracks: integer('totalTracks'),
		forTesting: boolean('forTesting').notNull(),
		imageUrl: varchar('imageUrl', { length: 255 }),
		tracklist: jsonb('tracklist'),

		// relations
		curatorId: cuid('curatorId').references(() => Users.id),
		// spotifyProviderAccountId: varchar('spotifyProviderAccountId', {
		// 	length: 255,
		// }).references(() => ProviderAccounts.providerAccountId),

		coverId: cuid('coverId').references(() => Files.id),
		spotifyLinkId: cuid('spotifyLinkId').references(() => Links.id),
		appleMusicLinkId: cuid('appleMusicLinkId').references(() => Links.id),
		deezerLinkId: cuid('deezerLinkId').references(() => Links.id),
		soundCloudLinkId: cuid('soundCloudLinkId').references(() => Links.id),
		tidalLinkId: cuid('tidalLinkId').references(() => Links.id),
		youtubeLinkId: cuid('youtubeLinkId').references(() => Links.id),

		cloneParentId: cuid('cloneParentId'),
	},

	playlist => ({
		// primary: primaryKey(playlist.workspaceId, playlist.id),
		workspace: index('Playlists_workspace_idx').on(playlist.workspaceId),
	}),
);

export const Playlist_Relations = relations(Playlists, ({ one, many }) => ({
	// one-to-one
	cover: one(Files, {
		fields: [Playlists.coverId],
		references: [Files.id],
	}),
	spotifyLink: one(Links, {
		fields: [Playlists.spotifyLinkId],
		references: [Links.id],
	}),
	appleMusicLink: one(Links, {
		fields: [Playlists.appleMusicLinkId],
		references: [Links.id],
	}),

	// one-to-many
	cloneParent: one(Playlists, {
		fields: [Playlists.cloneParentId],
		references: [Playlists.id],
	}),
	curator: one(Users, {
		fields: [Playlists.curatorId],
		references: [Users.id],
	}),
	// spotifyAccount: one(ProviderAccounts, {
	// 	fields: [Playlists.spotifyProviderAccountId],
	// 	references: [ProviderAccounts.providerAccountId],
	// }),
	workspace: one(Workspaces, {
		fields: [Playlists.workspaceId],
		references: [Workspaces.id],
	}),

	// many-to-one
	campaigns: many(Campaigns),
	placements: many(PlaylistPlacements),
	stats: many(Stats),

	// many-to-many
	_genres: many(_Playlists_To_Genres),
	_providerAccounts: many(_Playlists_To_ProviderAccounts),
}));

// join tables
export const _Playlists_To_ProviderAccounts = pgTable(
	'_Playlists_To_ProviderAccounts',
	{
		playlistId: cuid('playlistId').notNull(),
		providerAccountId: varchar('providerAccountId', { length: 255 }).notNull(),
	},
	ptp => ({
		primary: primaryKey(ptp.playlistId, ptp.providerAccountId),
	}),
);

export const _Playlists_To_ProviderAccounts_Relations = relations(
	_Playlists_To_ProviderAccounts,
	({ one }) => ({
		// one-to-one
		playlist: one(Playlists, {
			fields: [_Playlists_To_ProviderAccounts.playlistId],
			references: [Playlists.id],
		}),
		providerAccount: one(ProviderAccounts, {
			fields: [_Playlists_To_ProviderAccounts.providerAccountId],
			references: [ProviderAccounts.providerAccountId],
		}),
	}),
);
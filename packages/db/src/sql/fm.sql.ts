import { FM_LINK_PLATFORMS } from '@barely/const';
import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, varchar } from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../utils';
import { Files } from './file.sql';
import { Workspaces } from './workspace.sql';

export const FmPages = pgTable('FmPages', {
	...primaryId,
	...timestamps,

	archived: boolean('archived').default(false).notNull(),
	workspaceId: dbId('workspaceId')
		.notNull()
		.references(() => Workspaces.id, {
			onDelete: 'cascade',
		}),
	// link
	handle: varchar('handle', { length: 255 })
		.notNull()
		.references(() => Workspaces.handle, {
			onUpdate: 'cascade',
		}),

	key: varchar('key', { length: 255 }).notNull(),
	// source
	sourceUrl: varchar('sourceUrl', { length: 255 }).notNull(),
	//genre
	genre: varchar('genre', { length: 255 }),
	// title
	title: varchar('title', { length: 255 }).notNull(),
	// design
	coverArtId: dbId('coverArtId').references(() => Files.id),
	scheme: varchar('scheme', { length: 255, enum: ['light', 'dark'] }).notNull(),
	showSocial: boolean('showSocial').default(false).notNull(),
	// remarketing
	remarketing: boolean('remarketing').default(false).notNull(),
	views: integer('views').default(0),
	clicks: integer('clicks').default(0),
	amazonMusicClicks: integer('amazonMusicClicks').default(0),
	appleMusicClicks: integer('appleMusicClicks').default(0),
	deezerClicks: integer('deezerClicks').default(0),
	itunesClicks: integer('itunesClicks').default(0),
	spotifyClicks: integer('spotifyClicks').default(0),
	tidalClicks: integer('tidalClicks').default(0),
	tiktokClicks: integer('tiktokClicks').default(0),
	youtubeClicks: integer('youtubeClicks').default(0),
	youtubeMusicClicks: integer('youtubeMusicClicks').default(0),
});

export const FmPagesRelations = relations(FmPages, ({ one, many }) => ({
	workspace: one(Workspaces, {
		fields: [FmPages.workspaceId],
		references: [Workspaces.id],
	}),

	coverArt: one(Files, {
		fields: [FmPages.coverArtId],
		references: [Files.id],
	}),

	links: many(FmLinks),
}));

// FmLinks
export const FmLinks = pgTable('FmLinks', {
	...primaryId,
	...timestamps,
	fmPageId: dbId('fmPageId')
		.notNull()
		.references(() => FmPages.id, {
			onDelete: 'cascade',
		}),
	index: integer('index').notNull(),

	// link
	platform: varchar('platform', {
		length: 255,
		enum: FM_LINK_PLATFORMS,
	}).notNull(),
	url: varchar('url', { length: 255 }).notNull(),
	spotifyTrackUrl: varchar('spotifyTrackUrl', { length: 255 }),
	customPlatformName: varchar('customPlatformName', { length: 255 }),
	customButtonTextColor: varchar('customButtonTextColor', { length: 255 }),
	clicks: integer('clicks').default(0),
});

export const FmLinksRelations = relations(FmLinks, ({ one }) => ({
	fmPage: one(FmPages, {
		fields: [FmLinks.fmPageId],
		references: [FmPages.id],
	}),
}));

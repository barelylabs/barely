import { relations } from 'drizzle-orm';
import { boolean, jsonb, pgTable, text, varchar } from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../../../utils/sql';
import { _Files_To_PressKits_PressPhotos } from '../file/file.sql';
import { Mixtapes } from '../mixtape/mixtape.sql';
import { Workspaces } from '../workspace/workspace.sql';

export const PressKits = pgTable('PressKits', {
	...primaryId,
	workspaceId: dbId('workspaceId')
		.notNull()
		.references(() => Workspaces.id, {
			onUpdate: 'cascade',
			onDelete: 'cascade',
		}),
	handle: varchar('handle', { length: 255 })
		.notNull()
		.references(() => Workspaces.handle, {
			onUpdate: 'cascade',
		}),

	...timestamps,

	// bio
	showBio: boolean('showBio').default(false).notNull(),
	overrideWorkspaceBio: boolean('overrideWorkspaceBio').default(false).notNull(),
	bio: text('bio'), // markdown

	// mixtape
	showMixtape: boolean('showMixtape').default(false).notNull(),
	mixtapeId: dbId('mixtapeId').references(() => Mixtapes.id),

	// videos
	showVideos: boolean('showVideos').default(false).notNull(),
	videos:
		jsonb('videos').$type<{ title?: string; url: string; description?: string }[]>(),
	showPressPhotos: boolean('showPressPhotos').default(false).notNull(),
	showBooking: boolean('showBooking').default(false).notNull(),

	// press quotes
	showPressQuotes: boolean('showPressQuotes').default(false).notNull(),
	pressQuotes:
		jsonb('pressQuotes').$type<{ quote: string; source: string; link?: string }[]>(),

	// social links
	showSocialLinks: boolean('showSocialLinks').default(false).notNull(),
	showFacebookLink: boolean('showFacebookLink').default(false).notNull(),
	showInstagramLink: boolean('showInstagramLink').default(false).notNull(),
	showSpotifyLink: boolean('showSpotifyLink').default(false).notNull(),
	showTiktokLink: boolean('showTiktokLink').default(false).notNull(),
	showXLink: boolean('showXLink').default(false).notNull(),
	showYoutubeLink: boolean('showYoutubeLink').default(false).notNull(),

	// social stats
	showSocialStats: boolean('showSocialStats').default(false).notNull(),
	showSpotifyFollowers: boolean('showSpotifyFollowers').default(false).notNull(),
	showSpotifyMonthlyListeners: boolean('showSpotifyMonthlyListeners')
		.default(false)
		.notNull(),
	showYoutubeSubscribers: boolean('showYoutubeSubscribers').default(false).notNull(),
	showTiktokFollowers: boolean('showTiktokFollowers').default(false).notNull(),
	showInstagramFollowers: boolean('showInstagramFollowers').default(false).notNull(),
	showXFollowers: boolean('showXFollowers').default(false).notNull(),
	showFacebookFollowers: boolean('showFacebookFollowers').default(false).notNull(),
});

export const PressKit_Relations = relations(PressKits, ({ one, many }) => ({
	// one-to-many
	workspace: one(Workspaces, {
		fields: [PressKits.workspaceId, PressKits.handle],
		references: [Workspaces.id, Workspaces.handle],
	}),
	mixtape: one(Mixtapes, {
		fields: [PressKits.mixtapeId],
		references: [Mixtapes.id],
	}),

	// many-to-many
	_pressPhotos: many(_Files_To_PressKits_PressPhotos, {
		relationName: '_pressPhoto_pressKit',
	}),
}));

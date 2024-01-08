import { relations } from 'drizzle-orm';
import { index, pgTable, varchar } from 'drizzle-orm/pg-core';

import { cuid, primaryId, timestamps } from '../utils/sql';
import { Ads } from './ad.sql';
import { Links } from './link.sql';
import { ProviderAccounts } from './provider-account.sql';
import { Workspaces } from './workspace.sql';

export const AdCreatives = pgTable(
	'AdCreatives',
	{
		...primaryId,
		workspaceId: cuid('workspaceId')
			.notNull()
			.references(() => Workspaces.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade',
			}),

		...timestamps,

		name: varchar('name', { length: 255 }).notNull(),
		metaId: varchar('metaId', { length: 255 }),
		metaPostId: varchar('metaPostId', { length: 255 }),
		callToActionType: varchar('callToActionType', { length: 255 }),
		linkCaption: varchar('linkCaption', { length: 255 }),
		urlTags: varchar('urlTags', { length: 255 }),

		tiktokId: varchar('tiktokId', { length: 255 }),

		// relations

		metaAccountId: cuid('metaAccountId').notNull(),
		tiktokAccountId: cuid('tiktokAccountId'),
		headlineId: cuid('headlineId'),
		linkId: cuid('linkId').notNull(),
	},
	adCreative => {
		return {
			// primary: primaryKey(adCreative.workspaceId, adCreative.id),
			workspace: index('AdCreatives_workspace_idx').on(adCreative.workspaceId),
			metaAccount: index('AdCreatives_metaAccount_idx').on(adCreative.metaAccountId),
			headline: index('AdCreatives_headline_idx').on(adCreative.headlineId),
			link: index('AdCreatives_link_idx').on(adCreative.linkId),
			tiktokAccount: index('AdCreatives_tiktokAccount_idx').on(
				adCreative.tiktokAccountId,
			),
		};
	},
);

export const AdCreative_Relations = relations(AdCreatives, ({ one, many }) => ({
	// one-to-many
	workspace: one(Workspaces, {
		fields: [AdCreatives.workspaceId],
		references: [Workspaces.id],
	}),
	metaAccount: one(ProviderAccounts, {
		relationName: 'metaAccountToAdCreatives',
		fields: [AdCreatives.metaAccountId],
		references: [ProviderAccounts.providerAccountId],
	}),
	tiktokAccount: one(ProviderAccounts, {
		relationName: 'tiktokAccountToAdCreatives',
		fields: [AdCreatives.tiktokAccountId],
		references: [ProviderAccounts.providerAccountId],
	}),
	headline: one(AdHeadlines, {
		fields: [AdCreatives.headlineId],
		references: [AdHeadlines.id],
	}),
	link: one(Links, {
		fields: [AdCreatives.linkId],
		references: [Links.id],
	}),

	// many-to-one
	ads: many(Ads),
}));

// 📰 headlines
export const AdHeadlines = pgTable('AdHeadlines', {
	...primaryId,
	...timestamps,
	headline: varchar('headline', { length: 255 }).notNull(),
});

export const AdHeadline_Relations = relations(AdHeadlines, ({ many }) => ({
	// many-to-many
	adCreatives: many(AdCreatives),
}));

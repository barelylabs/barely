import { relations } from 'drizzle-orm';
import { boolean, index, pgTable, varchar } from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../../../utils/sql';
import { AdCreatives } from '../ad-creative/ad-creative.sql';
import { AdSets } from '../ad-set/ad-set.sql';
import { Stats } from '../stat/stat.sql';
import { Workspaces } from '../workspace/workspace.sql';

export const Ads = pgTable(
	'Ads',
	{
		...primaryId,
		workspaceId: dbId('workspaceId')
			.notNull()
			.references(() => Workspaces.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade',
			}),

		...timestamps,

		// external
		metaId: varchar('metaId', { length: 255 }),
		tiktokId: varchar('tiktokId', { length: 255 }),
		metaStatus: varchar('status', {
			length: 255,
			enum: ['ACTIVE', 'PAUSED', 'ERROR'],
		}).notNull(),

		// internal
		passedTest: boolean('passedTest'),

		// relations
		adSetId: dbId('adSetId')
			.notNull()
			.references(() => AdSets.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade',
			}),

		adCreativeId: dbId('adCreativeId')
			.notNull()
			.references(() => AdCreatives.id),
	},
	ad => {
		return {
			workspace: index('Ads_workspace_idx').on(ad.workspaceId),
			adSet: index('Ads_adSet_idx').on(ad.adSetId),
			creative: index('Ads_creative_idx').on(ad.adCreativeId),
		};
	},
);

export const Ad_Relations = relations(Ads, ({ one, many }) => ({
	// one-to-one
	adSet: one(AdSets, {
		fields: [Ads.adSetId],
		references: [AdSets.id],
	}),
	// one-to-many
	adCreative: one(AdCreatives, {
		fields: [Ads.adCreativeId],
		references: [AdCreatives.id],
	}),
	// many-to-one
	stats: many(Stats),
}));

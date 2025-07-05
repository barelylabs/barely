import { relations } from 'drizzle-orm';
import {
	boolean,
	index,
	integer,
	pgTable,
	timestamp,
	varchar,
} from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../utils';
import { AdSets } from './ad-set.sql';
import { Campaigns } from './campaign.sql';
import { ProviderSubAccounts } from './provider-sub-account.sql';
import { VidRenders } from './vid-render.sql';
import { Workspaces } from './workspace.sql';

export const AdCampaigns = pgTable(
	'AdCampaigns',
	{
		...primaryId,
		workspaceId: dbId('workspaceId')
			.notNull()
			.references(() => Workspaces.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade',
			}),

		...timestamps,

		name: varchar('name', { length: 255 }).notNull(),
		startDate: timestamp('startDate', { mode: 'string' }).notNull(),
		endDate: timestamp('endDate', { mode: 'string' }),

		splitTestDemos: boolean('splitTestDemos').default(false).notNull(),
		splitTestGeoGroups: boolean('splitTestGeoGroups').default(false).notNull(),
		splitTestInterestGroups: boolean('splitTestInterestGroups').default(false).notNull(),

		metaId: varchar('metaId', { length: 255 }),
		metaDailyBudget: integer('metaDailyBudget'),
		metaLifetimeBudget: integer('metaLifetimeBudget'),
		metaTriggerPercentage: integer('metaTriggerPercentage'),
		metaStatus: varchar('status', {
			length: 255,
			enum: ['ACTIVE', 'PAUSED', 'ERROR'],
		}).notNull(),

		// relations
		campaignId: dbId('campaignId').notNull(),
		metaAdAccountId: dbId('metaAdAccountId').notNull(),
	},
	adCampaign => ({
		// primary: primaryKey(adCampaign.workspaceId, adCampaign.id),
		workspace: index('AdCampaigns_workspace_idx').on(adCampaign.workspaceId),
		campaign: index('AdCampaigns_campaign_idx').on(adCampaign.campaignId),
		metaAdAccount: index('AdCampaigns_metaAdAccount_idx').on(adCampaign.metaAdAccountId),
	}),
);

export const AdCampaign_Relations = relations(AdCampaigns, ({ one, many }) => ({
	// one-to-many
	campaign: one(Campaigns, {
		fields: [AdCampaigns.campaignId],
		references: [Campaigns.id],
	}),

	metaAdAccount: one(ProviderSubAccounts, {
		fields: [AdCampaigns.metaAdAccountId],
		references: [ProviderSubAccounts.providerId],
	}),

	// many-to-one
	adSets: many(AdSets),
	vidRenders: many(VidRenders),
}));

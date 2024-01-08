import { relations } from 'drizzle-orm';
import {
	index,
	integer,
	pgTable,
	primaryKey,
	text,
	timestamp,
	varchar,
} from 'drizzle-orm/pg-core';

import { cuid, id, primaryId, timestamps } from '../utils/sql';
import { AdCampaigns } from './ad-campaign.sql';
import { PlaylistPitchReviews } from './playlist-pitch-review.sql';
import { Playlists } from './playlist.sql';
import { Tracks } from './track.sql';
import { TransactionLineItems } from './transaction-line-item.sql';
import { Users } from './user.sql';
import { Workspaces } from './workspace.sql';

const campaignStageEnum = [
	'screening',
	'rejected',
	'approved',
	'queuedForTesting',
	'errorInTestingQueue',
	'testing',
	'testingComplete',
	'active',
	'paused',
	'complete',
] as const;

export const Campaigns = pgTable(
	'Campaigns',
	{
		// id: cuid('id').notNull(),
		...primaryId,
		workspaceId: cuid('workspaceId')
			.notNull()
			.references(() => Workspaces.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade',
			}),

		...timestamps,

		type: text('type', {
			enum: [
				'playlistPitch',
				'fbSpark',
				'igSpark',
				'tiktokSpark',
				'playlistSpark',
				'gigSpark',
				'fbCharge',
				'igCharge',
				'spotifyCharge',
			],
		}).notNull(),
		stage: text('stage', {
			enum: campaignStageEnum,
		}).notNull(),

		endDate: timestamp('endDate', { mode: 'string' }),
		screeningMessage: varchar('screeningMessage', { length: 1000 }),
		curatorReach: integer('curatorReach'),

		// relations
		createdById: cuid('createdById').notNull(),
		trackId: cuid('trackId').notNull(),
		playlistId: cuid('playlistId'),
	},
	campaign => ({
		// primary: primaryKey(campaign.workspaceId, campaign.id),
		workspace: index('Campaigns_workspace_idx').on(campaign.workspaceId),
		track: index('Campaigns_track_idx').on(campaign.trackId),
		playlist: index('Campaigns_playlist_idx').on(campaign.playlistId),
	}),
);

export const CampaignRelations = relations(Campaigns, ({ one, many }) => ({
	// one-to-many
	createdBy: one(Users, {
		fields: [Campaigns.createdById],
		references: [Users.id],
	}),
	track: one(Tracks, {
		fields: [Campaigns.trackId],
		references: [Tracks.id],
	}),
	playlist: one(Playlists, {
		fields: [Campaigns.playlistId],
		references: [Playlists.id],
	}),
	workspace: one(Workspaces, {
		fields: [Campaigns.workspaceId],
		references: [Workspaces.id],
	}),

	// many-to-one
	adCampaigns: many(AdCampaigns),
	playlistPitchReviews: many(PlaylistPitchReviews),
	transactionLineItems: many(TransactionLineItems),
	updateRecords: many(CampaignUpdateRecords),
}));

// 🗃️ update records

export const CampaignUpdateRecords = pgTable(
	'CampaignUpdateRecords',
	{
		...id,
		...timestamps,
		stage: text('stage', { enum: campaignStageEnum }).notNull(),

		// relations
		campaignId: cuid('campaignId')
			.notNull()
			.references(() => Campaigns.id, {
				onDelete: 'cascade',
			}),
		createdById: cuid('creatorId')
			.notNull()
			.references(() => Users.id),
	},
	campaignUpdate => ({
		primary: primaryKey(campaignUpdate.campaignId, campaignUpdate.id),
	}),
);

export const CampaignUpdateRecordRelations = relations(
	CampaignUpdateRecords,
	({ one }) => ({
		// one-to-many
		updatedBy: one(Users, {
			fields: [CampaignUpdateRecords.createdById],
			references: [Users.id],
		}),
		campaign: one(Campaigns, {
			fields: [CampaignUpdateRecords.campaignId],
			references: [Campaigns.id],
		}),
	}),
);

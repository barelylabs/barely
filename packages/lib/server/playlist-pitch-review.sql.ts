import { relations } from 'drizzle-orm';
import { index, integer, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../utils/sql';
import { Campaigns } from './campaign.sql';
import { PlaylistPlacements } from './playlist-placement.sql';
import { Users } from './user.sql';

export const PlaylistPitchReviews = pgTable(
	'PlaylistPitchReviews',
	{
		...primaryId,
		...timestamps,
		stage: varchar('stage', {
			length: 255,
			enum: ['reviewing', 'placed', 'rejected', 'expired'],
		}).notNull(),
		expiresAt: timestamp('expiresAt', { mode: 'string' }).notNull(),
		review: text('review').notNull(),
		rating: integer('rating').notNull(),
		rejectReason: varchar('rejectReason', { length: 255 }),

		// relations
		campaignId: dbId('campaignId').notNull(),
		reviewerId: dbId('reviewerId').notNull(),
	},
	review => ({
		// primary: primaryKey(review.campaignId, review.reviewerId, review.id),
		campaign: index('PlaylistPitchReviews_campaign_idx').on(review.campaignId),
		reviewer: index('PlaylistPitchReviews_reviewer_idx').on(review.reviewerId),
	}),
);

export const PlaylistPitchReview_Relations = relations(
	PlaylistPitchReviews,
	({ one, many }) => ({
		// one-to-many
		campaign: one(Campaigns, {
			fields: [PlaylistPitchReviews.campaignId],
			references: [Campaigns.id],
		}),
		reviewer: one(Users, {
			fields: [PlaylistPitchReviews.reviewerId],
			references: [Users.id],
		}),

		// many-to-one
		placements: many(PlaylistPlacements),
	}),
);

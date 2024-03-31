import type { InferSelectModel } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { createPlaylistPlacementSchema } from '../playlist-placement/playlist-placement.schema';
import { PlaylistPitchReviews } from './playlist-pitch-review.sql';

export const insertPlaylistPitchReviewSchema = createInsertSchema(PlaylistPitchReviews);
export const createPlaylistPitchReviewSchema = insertPlaylistPitchReviewSchema.omit({
	id: true,
});
export const selectPlaylistPitchReviewSchema = createSelectSchema(PlaylistPitchReviews);

export type PlaylistPitchReview = InferSelectModel<typeof PlaylistPitchReviews>;
export type InsertPlaylistPitchReview = z.infer<typeof insertPlaylistPitchReviewSchema>;
export type CreatePlaylistPitchReview = z.infer<typeof createPlaylistPitchReviewSchema>;

// forms

export const submitPlaylistPitchReviewSchema = insertPlaylistPitchReviewSchema
	.omit({
		reviewerId: true,
	})
	.extend({
		rating: z
			.number()
			.gte(1, 'Please choose a rating between 1-5')
			.lte(5, 'Please choose a rating between 1-5'),
		stage: insertPlaylistPitchReviewSchema.shape.stage.extract(['placed', 'rejected']),
		placements: z.array(createPlaylistPlacementSchema.extend({ place: z.boolean() })),
	})
	.refine(review => {
		if (
			review.stage === 'placed' &&
			review.placements?.filter(p => p.place).length === 0
		) {
			return {
				message: 'You must select at least one playlist to place your track',
				path: ['placementPlaylistIds'],
			};
		}

		if (review.stage === 'rejected' && !review.rejectReason) {
			return {
				message: 'You must provide a reason for rejecting this track',
				path: ['rejectReason'],
			};
		}

		return true;
	});

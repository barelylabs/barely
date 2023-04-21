import { z } from 'zod';

import { createPlaylistPlacementSchema } from '../playlist-placement/playlist-placement.schema';

const pitchReviewStageSchema = z.enum(['reviewing', 'placed', 'rejected', 'expired']);
const submitPitchReviewStageSchema = z.enum(['placed', 'rejected']);

const pitchReviewSchema = z.object({
	id: z.string(),
	campaignId: z.string(),
	reviewerId: z.string(),
	stage: pitchReviewStageSchema,
	review: z.string(),
	rating: z.number(),
	rejectReason: z.string().nullish(),
});

const createPitchReviewSchema = pitchReviewSchema.omit({ id: true, reviewerId: true });

const submitPitchReviewSchema = pitchReviewSchema
	.omit({
		campaignId: true,
		reviewerId: true,
	})
	.extend({
		rating: pitchReviewSchema.shape.rating
			.min(1, 'Please choose a rating between 1-5')
			.max(5),
		stage: submitPitchReviewStageSchema,
		placements: z.array(createPlaylistPlacementSchema).optional(),
	})
	.refine(review => {
		if (review.stage === 'placed' && !review.placements) {
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

export { pitchReviewSchema, createPitchReviewSchema, submitPitchReviewSchema };

import { z } from 'zod';

import { prisma } from '@barely/db';

import {
	campaignIncludeTrackAndMetadataConfig,
	CampaignWithTrackAndMetadata,
} from '../campaign/campaign.node.fns';
import { privateProcedure, router } from '../trpc';
import { submitPitchReviewSchema } from './playlist-pitch-review-schema';

export const playlistPitchReviewRouter = router({
	countByCampaignId: privateProcedure
		.input(
			z.object({
				campaignId: z.string(),
				complete: z.boolean().optional(),
			}),
		)
		.query(async ({ input }) => {
			const count = await prisma.playlistPitchReview.count({
				where: {
					campaignId: input.campaignId,
					rating: input.complete ? { gt: 0 } : { gte: 0 },
				},
			});

			return count;
		}),

	byCampaignId: privateProcedure
		.input(
			z.object({
				campaignId: z.string(),
				complete: z.boolean().optional(),
				limit: z.number().min(1).max(50).nullish(),
				cursor: z.date().nullish(),
			}),
		)
		.query(async ({ input }) => {
			const limit = input.limit ?? 20;
			const { cursor } = input;
			const reviews = await prisma.playlistPitchReview.findMany({
				take: limit + 1, // get an extra item at the end which we'll use as next cursor
				where: {
					campaignId: input.campaignId,
					rating: input.complete ? { gt: 0 } : { gte: 0 },
				},
				include: {
					reviewer: true,
					placements: { include: { playlist: true } },
				},
				cursor: cursor ? { createdAt: cursor } : undefined,
				orderBy: { createdAt: 'desc' },
			});

			let nextCursor: typeof cursor | undefined = undefined;
			if (reviews.length > limit) {
				const nextReview = reviews.pop();
				nextCursor = nextReview?.createdAt;
			}

			return {
				reviews,
				nextCursor,
			};
		}),

	toReview: privateProcedure.query(async ({ ctx }) => {
		const reviews = await prisma.playlistPitchReview.findMany({
			where: {
				reviewerId: ctx.user.id,
				stage: 'reviewing',
			},
			include: {
				campaign: { include: campaignIncludeTrackAndMetadataConfig },
			},
			take: 2,
		});

		const reviewsWithTracks = reviews
			.filter(review => review.campaign?.track)
			.map(review => ({
				...review,
				campaign: review.campaign as CampaignWithTrackAndMetadata,
			}));

		return reviewsWithTracks;
	}),

	submitReview: privateProcedure
		.input(submitPitchReviewSchema)
		.mutation(async ({ input, ctx }) => {
			const { id, placements, ...data } = input;

			await prisma.playlistPitchReview.update({
				where: {
					id_reviewerId: {
						id,
						reviewerId: ctx.user.id,
					},
				},
				data,
			});

			if (placements?.length) {
				await prisma.playlistPlacement.createMany({
					data: placements,
				});
			}
		}),
});

import type { TRPCRouterRecord } from '@trpc/server';
import type { SQL } from 'drizzle-orm';
import { dbHttp } from '@barely/db/client';
import { PlaylistPitchReviews } from '@barely/db/sql/playlist-pitch-review.sql';
import { PlaylistPlacements } from '@barely/db/sql/playlist-placement.sql';
import { sqlCount } from '@barely/db/utils';
import { newId } from '@barely/utils';
import { submitPlaylistPitchReviewSchema } from '@barely/validators';
import { and, desc, eq, gt, gte } from 'drizzle-orm';
import { z } from 'zod/v4';

import { privateProcedure } from '../trpc';

export const playlistPitchReviewRoute = {
	countByCampaignId: privateProcedure
		.input(
			z.object({
				campaignId: z.string(),
				complete: z.boolean().optional(),
			}),
		)
		.query(async ({ input }) => {
			const count = await dbHttp
				.select({
					count: sqlCount,
				})
				.from(PlaylistPitchReviews)
				.where(
					and(
						eq(PlaylistPitchReviews.campaignId, input.campaignId),
						input.complete ?
							gt(PlaylistPitchReviews.rating, 0)
						:	gte(PlaylistPitchReviews.rating, 0),
					),
				);

			return count[0]?.count ?? 0;
		}),

	byCampaignId: privateProcedure
		.input(
			z.object({
				campaignId: z.string(),
				complete: z.boolean().optional(),
				limit: z.number().min(1).max(50).nullish(),
				cursor: z.coerce.date().nullish(),
			}),
		)
		.query(async ({ input }) => {
			const limit = input.limit ?? 20;

			const where: SQL[] = [
				eq(PlaylistPitchReviews.campaignId, input.campaignId),
				input.complete ?
					gt(PlaylistPitchReviews.rating, 0)
				:	gte(PlaylistPitchReviews.rating, 0),
			];

			if (input.cursor) {
				where.push(gt(PlaylistPitchReviews.updatedAt, input.cursor));
			}

			const reviews = await dbHttp.query.PlaylistPitchReviews.findMany({
				where: and(...where),
				orderBy: desc(PlaylistPitchReviews.updatedAt),
				limit: limit + 1,
				with: {
					reviewer: true,
					placements: {
						with: {
							playlist: true,
						},
					},
				},
			});

			let nextCursor: typeof input.cursor | undefined = undefined;
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
		const reviews = await dbHttp.query.PlaylistPitchReviews.findMany({
			where: and(
				eq(PlaylistPitchReviews.reviewerId, ctx.user.id),
				eq(PlaylistPitchReviews.stage, 'reviewing'),
			),
			limit: 2,
			orderBy: desc(PlaylistPitchReviews.createdAt),
			with: {
				campaign: {
					with: {
						track: {
							with: {
								workspace: {
									columns: {
										name: true,
									},
								},
							},
						},
					},
				},
			},
		});

		return reviews;
	}),

	submitReview: privateProcedure
		.input(submitPlaylistPitchReviewSchema)
		.mutation(async ({ input }) => {
			const { id, placements, ...data } = input;

			await dbHttp
				.update(PlaylistPitchReviews)
				.set(data)
				.where(eq(PlaylistPitchReviews.id, id));

			if (placements.length) {
				await dbHttp
					.insert(PlaylistPlacements)
					.values(placements.map(p => ({ ...p, id: newId('playlistPitchReview') })));
			}
		}),
} satisfies TRPCRouterRecord;

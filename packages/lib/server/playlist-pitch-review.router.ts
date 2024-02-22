import type { SQL } from "drizzle-orm";
import { and, desc, eq, gt, gte } from "drizzle-orm";
import { z } from "zod";

import { newId } from "../utils/id";
import { sqlCount } from "../utils/sql";
import { createTRPCRouter, privateProcedure } from "./api/trpc";
import { submitPlaylistPitchReviewSchema } from "./playlist-pitch-review-schema";
import { PlaylistPitchReviews } from "./playlist-pitch-review.sql";
import { PlaylistPlacements } from "./playlist-placement.sql";

export const playlistPitchReviewRouter = createTRPCRouter({
  countByCampaignId: privateProcedure
    .input(
      z.object({
        campaignId: z.string(),
        complete: z.boolean().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const count = await ctx.db.http
        .select({
          count: sqlCount,
        })
        .from(PlaylistPitchReviews)
        .where(
          and(
            eq(PlaylistPitchReviews.campaignId, input.campaignId),
            input.complete
              ? gt(PlaylistPitchReviews.rating, 0)
              : gte(PlaylistPitchReviews.rating, 0),
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
        cursor: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 20;

      const where: SQL[] = [
        eq(PlaylistPitchReviews.campaignId, input.campaignId),
        input.complete
          ? gt(PlaylistPitchReviews.rating, 0)
          : gte(PlaylistPitchReviews.rating, 0),
      ];

      if (input.cursor) {
        where.push(gt(PlaylistPitchReviews.updatedAt, input.cursor));
      }

      const reviews = await ctx.db.http.query.PlaylistPitchReviews.findMany({
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
    const reviews = await ctx.db.http.query.PlaylistPitchReviews.findMany({
      where: and(
        eq(PlaylistPitchReviews.reviewerId, ctx.user.id),
        eq(PlaylistPitchReviews.stage, "reviewing"),
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
    .mutation(async ({ input, ctx }) => {
      const { id, placements, ...data } = input;

      await ctx.db.http
        .update(PlaylistPitchReviews)
        .set(data)
        .where(eq(PlaylistPitchReviews.id, id));

      if (placements?.length) {
        await ctx.db.http
          .insert(PlaylistPlacements)
          .values(
            placements.map((p) => ({ ...p, id: newId("playlistPitchReview") })),
          );
      }
    }),
});

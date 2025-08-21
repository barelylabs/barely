import type { TRPCRouterRecord } from '@trpc/server';
import { WEB_EVENT_TYPES__PAGE } from '@barely/const';
import { dbHttp } from '@barely/db/client';
import { LandingPages } from '@barely/db/sql/landing-page.sql';
import { publicProcedure } from '@barely/lib/trpc';
import { raiseTRPCError } from '@barely/utils';
import { eq } from 'drizzle-orm';
import { z } from 'zod/v4';

import { recordPageEvent } from '../../functions/event.fns';

export const landingPageRenderRoute = {
	log: publicProcedure
		.input(
			z.object({
				landingPageId: z.string(),
				type: z.enum(WEB_EVENT_TYPES__PAGE),
				linkClickDestinationAssetId: z.string().optional(),
				linkClickDestinationHref: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { visitor } = ctx;
			const {
				landingPageId,
				type,
				linkClickDestinationAssetId,
				linkClickDestinationHref,
			} = input;

			console.log('logging landingPageEvent', { landingPageId });

			const lp =
				(await dbHttp.query.LandingPages.findFirst({
					where: eq(LandingPages.id, landingPageId),
					with: {
						workspace: {
							columns: {
								id: true,
								plan: true,
								eventUsage: true,
								eventUsageLimitOverride: true,
							},
						},
					},
				})) ?? raiseTRPCError({ message: 'Landing page not found' });

			await recordPageEvent({
				page: lp,
				type,
				visitor,
				linkClickDestinationAssetId,
				linkClickDestinationHref,
				workspace: lp.workspace,
			});
		}),
} satisfies TRPCRouterRecord;

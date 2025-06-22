import { eq } from 'drizzle-orm';
import { z } from 'zod/v4';

import { raise } from '../../../utils/raise';
import { createTRPCRouter, publicProcedure } from '../../api/trpc';
import { recordPageEvent } from '../event/event.fns';
import { WEB_EVENT_TYPES__PAGE } from '../event/event.tb';
import { LandingPages } from '../landing-page/landing-page.sql';

export const landingPageRenderRouter = createTRPCRouter({
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
				(await ctx.db.http.query.LandingPages.findFirst({
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
				})) ?? raise('Landing page not found');

			await recordPageEvent({
				page: lp,
				type,
				visitor,
				linkClickDestinationAssetId,
				linkClickDestinationHref,
				workspace: lp.workspace,
			});
		}),
});

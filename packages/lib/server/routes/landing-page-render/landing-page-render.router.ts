import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { raise } from '../../../utils/raise';
import { createTRPCRouter, publicProcedure } from '../../api/trpc';
import { recordLandingPageEvent } from '../event/event.fns';
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
				})) ?? raise('Landing page not found');

			await recordLandingPageEvent({
				page: lp,
				type,
				visitor,
				linkClickDestinationAssetId,
				linkClickDestinationHref,
			});
		}),
});

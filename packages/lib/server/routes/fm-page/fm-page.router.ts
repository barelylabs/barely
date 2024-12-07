import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { raise } from '../../../utils/raise';
import { createTRPCRouter, publicProcedure } from '../../api/trpc';
import { recordFmEvent } from '../event/event.fns';
import { WEB_EVENT_TYPES__FM } from '../event/event.tb';
import { FM_LINK_PLATFORMS } from '../fm/fm.constants';
import { FmLinks, FmPages } from '../fm/fm.sql';

export const fmPageRouter = createTRPCRouter({
	log: publicProcedure
		.input(
			z.object({
				fmId: z.string(),
				type: z.enum(WEB_EVENT_TYPES__FM),
				fmLinkParams: z
					.object({
						platform: z.enum(FM_LINK_PLATFORMS),
					})
					.optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { visitor } = ctx;
			console.log('fmPageRouter.log visitor >>', visitor);
			const { fmId, fmLinkParams, type } = input;

			const fmPage =
				(await ctx.db.http.query.FmPages.findFirst({
					where: eq(FmPages.id, fmId),
				})) ?? raise('fmPage not found');

			const fmLink =
				!fmLinkParams ? undefined : (
					(await ctx.db.http.query.FmLinks.findFirst({
						where: and(
							eq(FmLinks.fmPageId, fmId),
							eq(FmLinks.platform, fmLinkParams.platform),
						),
					})) ?? raise('fmLink not found')
				);

			await recordFmEvent({
				fmPage,
				fmLink,
				visitor,
				type,
			});
		}),
});

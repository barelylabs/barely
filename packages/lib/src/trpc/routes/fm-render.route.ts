import { FM_LINK_PLATFORMS, WEB_EVENT_TYPES__FM } from '@barely/const';
import { dbHttp } from '@barely/db/client';
import { FmLinks, FmPages } from '@barely/db/sql/fm.sql';
import { publicProcedure } from '@barely/lib/trpc';
import { raiseTRPCError } from '@barely/utils';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod/v4';

import { recordFmEvent } from '../../functions/event.fns';

export const fmRenderRoute = {
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
				(await dbHttp.query.FmPages.findFirst({
					where: eq(FmPages.id, fmId),
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
				})) ?? raiseTRPCError({ message: 'fmPage not found' });

			const fmLink =
				!fmLinkParams ? undefined : (
					((await dbHttp.query.FmLinks.findFirst({
						where: and(
							eq(FmLinks.fmPageId, fmId),
							eq(FmLinks.platform, fmLinkParams.platform),
						),
					})) ?? raiseTRPCError({ message: 'fmLink not found' }))
				);

			await recordFmEvent({
				fmPage,
				fmLink,
				visitor,
				type,
				workspace: fmPage.workspace,
			});
		}),
};

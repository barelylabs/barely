import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '../../api/trpc';
import { EmailDeliveries } from '../email-delivery/email-delivery.sql';
import { Fans } from '../fan/fan.sql';

export const emailManageRouter = createTRPCRouter({
	toggleEmailMarketingOptIn: publicProcedure
		.input(
			z.object({
				emailDeliveryId: z.string(),
				forceUnsubscribe: z.boolean().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { emailDeliveryId, forceUnsubscribe } = input;

			const emailDelivery = await ctx.db.pool.query.EmailDeliveries.findFirst({
				where: eq(EmailDeliveries.id, emailDeliveryId),
				with: {
					workspace: {
						columns: {
							handle: true,
							name: true,
						},
					},
					fan: {
						columns: {
							id: true,
							emailMarketingOptIn: true,
						},
					},
				},
			});

			if (!emailDelivery) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Email delivery not found',
				});
			}

			const { fan } = emailDelivery;

			const newEmailMarketingOptIn = forceUnsubscribe ? false : !fan.emailMarketingOptIn;

			await ctx.db.pool
				.update(Fans)
				.set({
					emailMarketingOptIn: newEmailMarketingOptIn,
				})
				.where(eq(Fans.id, fan.id));

			const workspaceDisplayName =
				emailDelivery.workspace.name.length > 0 ?
					emailDelivery.workspace.name
				:	emailDelivery.workspace.handle;

			return {
				success: true,
				newEmailMarketingOptIn,
				workspaceDisplayName,
			};
		}),
});

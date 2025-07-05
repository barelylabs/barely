import { dbPool } from '@barely/db/pool';
import { EmailDeliveries } from '@barely/db/sql/email-delivery.sql';
import { Fans } from '@barely/db/sql/fan.sql';
import { publicProcedure } from '@barely/lib/trpc';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod/v4';

export const emailManageRoute = {
	toggleEmailMarketingOptIn: publicProcedure
		.input(
			z.object({
				emailDeliveryId: z.string(),
				forceUnsubscribe: z.boolean().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { emailDeliveryId, forceUnsubscribe } = input;

			const emailDelivery = await dbPool(ctx.pool).query.EmailDeliveries.findFirst({
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

			await dbPool(ctx.pool)
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
};

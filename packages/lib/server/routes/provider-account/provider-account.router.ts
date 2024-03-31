import { and, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';

import { createTRPCRouter, privateProcedure } from '../../api/trpc';
import { insertProviderAccountSchema } from './provider-account.schema';
import { ProviderAccounts } from './provider-account.sql';

const providerAccountRouter = createTRPCRouter({
	delete: privateProcedure
		.input(
			z.object({
				provider: insertProviderAccountSchema.shape.provider,
				providerAccountId: insertProviderAccountSchema.shape.providerAccountId,
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await ctx.db.http
				.delete(ProviderAccounts)
				.where(
					and(
						eq(ProviderAccounts.provider, input.provider),
						eq(ProviderAccounts.providerAccountId, input.providerAccountId),
					),
				);

			return;
		}),

	byCurrentUser: privateProcedure
		.input(
			z
				.object({
					providers: insertProviderAccountSchema.shape.provider.array().optional(),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const accounts = await ctx.db.http.query.ProviderAccounts.findMany({
				where: and(
					eq(ProviderAccounts.userId, ctx.user.id),
					// todo - check if this is working for filtering providerAccounts by provider(s)
					input?.providers
						? inArray(ProviderAccounts.provider, input.providers)
						: undefined,
				),
			});
			return accounts;
		}),
});

export { providerAccountRouter };

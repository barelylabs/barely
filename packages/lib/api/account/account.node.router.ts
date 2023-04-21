import { z } from 'zod';

import { prisma } from '@barely/db';

import { privateProcedure, router } from '../trpc';
import { accountPlatformSchema, oAuthProviderSchema } from './account.schema';

const accountRouter = router({
	delete: privateProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
		await prisma.account.delete({
			where: { id_userId: { id: input, userId: ctx.user.id } },
		});
		return;
	}),

	byCurrentUser: privateProcedure
		.input(
			z
				.object({
					providers: oAuthProviderSchema.array().optional(),
					platforms: accountPlatformSchema.array().optional(),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const accounts = await prisma.account.findMany({
				where: {
					user: { id: ctx.user.id },
					...(input?.providers && { provider: { in: input.providers } }),
					...(input?.platforms && { platform: { in: input.platforms } }),
				},
				take: 30,
			});
			return accounts;
		}),
});

export { accountRouter };

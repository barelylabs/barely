import { router, privateProcedure } from '../trpc';
import { z } from 'zod';

import { accountTypeSchema, accountProviderSchema } from '@barely/schema/db';

export const accountRouter = router({
	getByUser: privateProcedure
		.input(
			z
				.object({
					type: accountTypeSchema.array().optional(),
					provider: accountProviderSchema.array().optional(),
				})
				.optional(),
		)
		.query(async ({ ctx }) => {
			return await ctx.prisma.account.findMany({
				where: {
					user: { id: ctx.user.id },
				},
				take: 30,
			});
		}),
});

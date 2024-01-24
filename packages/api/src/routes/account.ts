import { router, privateProcedure } from '../trpc';
import { z } from 'zod';

import { accountPlatformSchema, oAuthProviderSchema } from '@barely/schema/db';

export const accountRouter = router({
	getByUser: privateProcedure
		.input(
			z
				.object({
					type: accountPlatformSchema.array().optional(),
					provider: oAuthProviderSchema.array().optional(),
				})
				.optional(),
		)
		.query(async ({ ctx }) => {
			ctx.user.privateMetadata;
			return await ctx.prisma.account.findMany({
				where: {
					user: { id: ctx.user.id },
				},
				take: 30,
			});
		}),
});

import { router, publicProcedure } from '../trpc';
import { visitorSessionCreateSchema } from '@barely/db/zod';
import { visitorSessionBaseSchema } from '@barely/db/zod/visitorsession';

export const visitorSessionRouter = router({
	create: publicProcedure
		.meta({ openapi: { method: 'POST', path: '/visitor-session/create' } })
		.input(visitorSessionCreateSchema)
		.output(visitorSessionBaseSchema)
		.mutation(async ({ ctx, input }) => {
			const visitorSession = await ctx.prisma.visitorSession.create({
				data: input,
			});
			return visitorSession;
		}),
});

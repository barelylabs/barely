import { router, publicProcedure, privateProcedure } from '../trpc';
import { visitorSessionCreateSchema } from '../../../schema/db';
import { prisma } from '@barely/db';

export const visitorSessionRouter = router({
	create: publicProcedure
		.input(visitorSessionCreateSchema)
		.mutation(async ({ ctx, input }) => {
			const visitorSession = await prisma.visitorSession.create({
				data: input,
			});
			return visitorSession;
		}),
});

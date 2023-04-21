import { prisma } from '@barely/db';

import { publicProcedure, router } from '../trpc';
import { visitorSessionSchema } from './visitor-session.schema';

export const visitorSessionRouter = router({
	create: publicProcedure
		.input(visitorSessionSchema.partial({ id: true }))
		.mutation(async ({ input }) => {
			const visitorSession = await prisma.visitorSession.create({
				data: input,
			});
			return visitorSession;
		}),
});

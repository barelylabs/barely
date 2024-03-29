import { newId } from '../utils/id';
import { createTRPCRouter, publicProcedure } from './api/trpc';
import { createVisitorSessionSchema } from './visitor-session.schema';
import { VisitorSessions } from './visitor-session.sql';

export const visitorSessionRouter = createTRPCRouter({
	create: publicProcedure
		.input(createVisitorSessionSchema)
		.mutation(async ({ input, ctx }) => {
			return await ctx.db.http
				.insert(VisitorSessions)
				.values({ ...input, id: newId('webSession') })
				.execute();
		}),
});

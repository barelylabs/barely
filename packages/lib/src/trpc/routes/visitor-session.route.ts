import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { VisitorSessions } from '@barely/db/sql/visitor-session.sql';
import { newId } from '@barely/utils';
import { createVisitorSessionSchema } from '@barely/validators';

import { publicProcedure } from '../trpc';

export const visitorSessionRoute = {
	create: publicProcedure
		.input(createVisitorSessionSchema)
		.mutation(async ({ input }) => {
			return await dbHttp
				.insert(VisitorSessions)
				.values({ ...input, id: newId('barelySession') })
				.execute();
		}),
} satisfies TRPCRouterRecord;

import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { eq } from 'drizzle-orm';
import { z } from 'zod/v4';

import { publicProcedure } from '../trpc';

export const bioRoute = {
	getById: publicProcedure.input(z.string()).query(async ({ input: bioId }) => {
		return await dbHttp.query.Bios.findFirst({
			where: Bios => eq(Bios.id, bioId),
		});
	}),
} satisfies TRPCRouterRecord;

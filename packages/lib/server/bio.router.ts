import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from './api/trpc';

export const bioRouter = createTRPCRouter({
	getById: publicProcedure.input(z.string()).query(async ({ input: bioId, ctx }) => {
		return await ctx.db.http.query.Bios.findFirst({
			where: Bios => eq(Bios.id, bioId),
		});
	}),
});

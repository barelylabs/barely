import { router, publicProcedure } from '../trpc';

export const campaignRouter = router({
	create: publicProcedure.input().mutation(async ({ ctx, input }) => {
		return await ctx.prisma.campaign.create({
			data: input,
		});
	}),
});

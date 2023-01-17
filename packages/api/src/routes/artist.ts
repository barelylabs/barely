import { router, publicProcedure, privateProcedure } from '../trpc';
import { z } from 'zod';

export const artistRouter = router({
	findAll: publicProcedure.query(async ({ ctx }) => {
		console.log('ctx => ', ctx);
		return await ctx.prisma.artist.findMany({ take: 10 });
	}),
	findByCurrentUser: privateProcedure.query(async ({ ctx }) => {
		return await ctx.prisma.artist.findMany({
			where: { owner: { id: ctx.user.id } },
			take: 20,
		});
	}),
	findByHandle: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
		return await ctx.prisma.artist.findFirst({ where: { handle: input } });
	}),
	findBySpotifyId: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
		return await ctx.prisma.artist.findFirst({ where: { spotifyId: input } });
	}),
});

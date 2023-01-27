import { router, publicProcedure } from '../trpc';
import { z } from 'zod';

export const trackRouter = router({
	findAll: publicProcedure.query(async ({ ctx }) => {
		console.log('ctx => ', ctx);
		return await ctx.prisma.track.findMany({ take: 10 });
	}),
	bySpotifyId: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
		return await ctx.prisma.track.findFirst({ where: { spotifyId: input } });
	}),
	// findByCurrentUser: privateProcedure.query(async ({ ctx }) => {
	// 	return await ctx.prisma.track.findMany({
	// 		where: { owner: { id: ctx.user.id } },
	// 		take: 20,
	// 	});
	// }),
	// findByHandle: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
	// 	return await ctx.prisma.artist.findFirst({ where: { handle: input } });
	// }),
});
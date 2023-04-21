import { z } from 'zod';

import { prisma } from '@barely/db';

import { privateProcedure, publicProcedure, router } from '../trpc';
import { getGenresByUserId } from './genre.node.fns';

export const genreRouter = router({
	allByPlaylists: publicProcedure
		.input(z.object({ playlistIds: z.array(z.string()) }).optional())
		.query(async ({ input }) => {
			const playlistIds = input?.playlistIds;

			return await prisma.genre.findMany({
				where: {
					playlistGenres: {
						some: {
							playlist: {
								AND: [
									{ id: { in: playlistIds } },
									{
										spotifyAccount: {
											user: {
												pitchReviewing: true,
											},
										},
									},
								],
							},
						},
					},
				},

				include: {
					_count: { select: { playlistGenres: true } },
				},
			});
		}),

	allByCurrentUser: privateProcedure.query(async ({ ctx }) => {
		if (!ctx.user?.id) return [];
		return await getGenresByUserId(ctx.user.id);
	}),
});

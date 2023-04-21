import { z } from 'zod';

import { prisma } from '@barely/db';

import { privateProcedure, publicProcedure, router } from '../trpc';
import {
	estimateGenresByPlaylistId,
	getPlaylistsByUserId,
	totalPlaylistReachByGenres,
	userGetPlaylistById,
} from './playlist.node.fns';

const playlistRouter = router({
	byId: privateProcedure.input(z.string()).query(async ({ ctx, input }) => {
		const playlist = await userGetPlaylistById({
			playlistId: input,
			userId: ctx.user.id,
		});

		return playlist;
	}),

	byCurrentUser: privateProcedure.query(async ({ ctx }) => {
		const { user } = ctx;

		console.log('user.id => ', user.id);

		return await getPlaylistsByUserId(user.id);
	}),

	byTeam: privateProcedure.input(z.string()).query(async ({ ctx, input }) => {
		const { user } = ctx;

		const playlists = await prisma.playlist.findMany({
			where: {
				team: {
					id: input,
					members: {
						some: {
							userId: user.id,
						},
					},
				},
			},
			include: {
				spotifyAccount: {
					select: {
						id: true,
						username: true,
					},
				},
			},
		});

		return playlists;
	}),

	countByGenres: publicProcedure.input(z.array(z.string())).query(async ({ input }) => {
		const { totalPlaylists, totalCurators } = await totalPlaylistReachByGenres(input);

		return {
			totalPlaylists,
			totalCurators,
		};
	}),

	estimateGenresById: privateProcedure.input(z.string()).mutation(async ({ input }) => {
		const playlistId = input;

		const gptGenres = await estimateGenresByPlaylistId({
			playlistId,
		});

		await Promise.allSettled(
			gptGenres.map(
				async genre =>
					// create an entry in the playlistGenre table for each genre if it doesn't exist already
					await prisma.playlistGenre.upsert({
						where: { playlistId_genreName: { playlistId, genreName: genre } },
						update: {},
						create: {
							genre: {
								connectOrCreate: {
									where: { name: genre },
									create: { name: genre },
								},
							},
							playlist: { connect: { id: playlistId } },
						},
					}),
			),
		);
	}),
});

export { playlistRouter };

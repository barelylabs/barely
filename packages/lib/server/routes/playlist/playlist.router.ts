import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod/v4';

import { createTRPCRouter, privateProcedure, publicProcedure } from '../../api/trpc';
import { insertGenreSchema } from '../genre/genre.schema';
import { _Playlists_To_Genres } from '../genre/genre.sql';
import {
	estimateGenresByPlaylistId,
	getPlaylistsByUserId,
	totalPlaylistReachByGenres,
	upsertPlaylistGenres,
	userGetPlaylistById,
} from './playlist.fns';

const playlistRouter = createTRPCRouter({
	byId: privateProcedure.input(z.string()).query(async ({ ctx, input: playlistId }) => {
		const playlist = await userGetPlaylistById(ctx.user.id, playlistId, ctx.db);

		console.log('playlist => ', playlist);

		return playlist;
	}),

	byCurrentUser: privateProcedure
		.input(
			z.object({
				forPitchPlacement: z.boolean().optional(),
			}),
		)
		.query(async ({ ctx }) => {
			console.log('user.id => ', ctx.user.id);

			return await getPlaylistsByUserId(ctx.user.id, ctx.db);
		}),

	byWorkspaceId: privateProcedure
		.input(
			z.object({
				workspaceId: z.string().optional(),
				forPitchPlacement: z.boolean().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const workspaceId = input.workspaceId ?? ctx.workspace.id;
			if (!workspaceId) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'no workspaceId',
				});
			}

			const rawPlaylists = await ctx.db.http.query.Playlists.findMany({
				where: Playlists => eq(Playlists.workspaceId, workspaceId),
				with: {
					_providerAccounts: {
						with: {
							providerAccount: true,
						},
					},
				},
			});

			const playlists = rawPlaylists.map(rawPlaylist => ({
				...rawPlaylist,
				providerAccounts: rawPlaylist._providerAccounts.map(_pa => _pa.providerAccount),
			}));

			if (input.forPitchPlacement) return playlists.filter(p => !p.forTesting);

			return playlists;
		}),

	countByGenres: publicProcedure
		// .meta({
		//   openapi: {
		//     method: "GET",
		//     path: "/playlist/reach-by-genres",
		//   },
		// })
		.input(
			z.object({
				genreIds: z.preprocess(
					val =>
						Array.isArray(val) ? (val as string[])
						: (
							typeof val === 'string' // assume comma-separated string
						) ?
							val.split(',').map((genre: string) => genre.trim())
						:	[],
					z.array(insertGenreSchema.shape.id),
				),
			}),
		)
		// .output(
		//   z.object({
		//     totalPlaylists: z.number(),
		//     totalCurators: z.number(),
		//     averagePlaylistsPerCurator: z.number(),
		//   }),
		// )
		.query(async ({ input }) => {
			const { totalPlaylists, totalCurators, averagePlaylistsPerCurator } =
				await totalPlaylistReachByGenres(input.genreIds);

			return {
				totalPlaylists,
				totalCurators,
				averagePlaylistsPerCurator,
			};
		}),

	estimateGenresById: privateProcedure
		.input(z.string())
		.mutation(async ({ ctx, input: playlistId }) => {
			const gptGenreIds = await estimateGenresByPlaylistId(playlistId, ctx.db);

			console.log('gptGenreIds => ', gptGenreIds);

			await upsertPlaylistGenres(playlistId, gptGenreIds, ctx.db);
		}),
});

export { playlistRouter };

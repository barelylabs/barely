import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { Playlists } from '@barely/db/sql/playlist.sql';
import { sqlAnd, sqlStringContains } from '@barely/db/utils';
import { newId } from '@barely/utils';
import {
	createPlaylistSchema,
	insertGenreSchema,
	selectWorkspacePlaylistsSchema,
	updatePlaylistSchema,
} from '@barely/validators';
import { TRPCError } from '@trpc/server';
import { and, asc, desc, eq, gt, isNull, lt, or, sql } from 'drizzle-orm';
import { z } from 'zod/v4';

import {
	estimateGenresByPlaylistId,
	getPlaylistsByUserId,
	totalPlaylistReachByGenres,
	upsertPlaylistGenres,
	userGetPlaylistById,
} from '../../functions/playlist.fns';
import { publicProcedure, workspaceProcedure } from '../trpc';

export const playlistRoute = {
	byWorkspace: workspaceProcedure
		.input(selectWorkspacePlaylistsSchema)
		.query(async ({ ctx, input }) => {
			const { limit, cursor, search, showArchived, showDeleted } = input;

			const rawPlaylists = await dbHttp.query.Playlists.findMany({
				where: sqlAnd([
					eq(Playlists.workspaceId, ctx.workspace.id),
					showArchived ? undefined : isNull(Playlists.archivedAt),
					showDeleted ? undefined : isNull(Playlists.deletedAt),
					!!search?.length && sqlStringContains(Playlists.name, search),
					!!cursor &&
						or(
							lt(Playlists.createdAt, cursor.createdAt),
							and(eq(Playlists.createdAt, cursor.createdAt), gt(Playlists.id, cursor.id)),
						),
				]),
				with: {
					_providerAccounts: {
						with: {
							providerAccount: true,
						},
					},
				},

				orderBy: [desc(Playlists.createdAt), asc(Playlists.id)],
				limit: limit + 1,
			});

			const playlists = rawPlaylists.map(rawPlaylist => ({
				...rawPlaylist,
				providerAccounts: rawPlaylist._providerAccounts.map(_pa => _pa.providerAccount),
			}));

			let nextCursor: typeof cursor | undefined = undefined;

			if (playlists.length > limit) {
				const nextPlaylist = playlists.pop();
				nextCursor =
					nextPlaylist ?
						{ id: nextPlaylist.id, createdAt: nextPlaylist.createdAt }
					:	undefined;
			}

			return {
				playlists,
				nextCursor,
			};
		}),

	byId: workspaceProcedure
		.input(
			z.object({
				handle: z.string(),
				playlistId: z.string(),
			}),
		)
		.query(async ({ ctx, input: { playlistId } }) => {
			const playlist = await userGetPlaylistById(ctx.user.id, playlistId, ctx.pool);

			console.log('playlist => ', playlist);

			return playlist;
		}),

	byCurrentUser: workspaceProcedure
		.input(
			z.object({
				forPitchPlacement: z.boolean().optional(),
			}),
		)
		.query(async ({ ctx }) => {
			console.log('user.id => ', ctx.user.id);

			return await getPlaylistsByUserId(ctx.user.id, ctx.pool);
		}),

	byWorkspaceId: workspaceProcedure
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

			const rawPlaylists = await dbHttp.query.Playlists.findMany({
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

	estimateGenresById: workspaceProcedure
		.input(z.object({ playlistId: z.string() }))
		.mutation(async ({ ctx, input: { playlistId } }) => {
			const gptGenreIds = await estimateGenresByPlaylistId(playlistId, ctx.pool);

			console.log('gptGenreIds => ', gptGenreIds);

			await upsertPlaylistGenres(playlistId, gptGenreIds, ctx.pool);
		}),

	create: workspaceProcedure
		.input(createPlaylistSchema)
		.mutation(async ({ ctx, input }) => {
			const playlist = await dbHttp
				.insert(Playlists)
				.values({
					...input,
					workspaceId: ctx.workspace.id,
					id: newId('playlist'),
				})
				.returning();

			return playlist[0];
		}),

	update: workspaceProcedure
		.input(updatePlaylistSchema)
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input;

			const playlist = await dbHttp
				.update(Playlists)
				.set({
					...data,
					updatedAt: sql`now()`,
				})
				.where(and(eq(Playlists.id, id), eq(Playlists.workspaceId, ctx.workspace.id)))
				.returning();

			return playlist[0];
		}),

	archive: workspaceProcedure
		.input(z.object({ ids: z.array(z.string()) }))
		.mutation(async ({ ctx, input }) => {
			const playlists = await dbHttp
				.update(Playlists)
				.set({
					archivedAt: sql`now()`,
					updatedAt: sql`now()`,
				})
				.where(
					and(
						sql`${Playlists.id} = ANY(${input})`,
						eq(Playlists.workspaceId, ctx.workspace.id),
						isNull(Playlists.archivedAt),
					),
				)
				.returning();

			return playlists;
		}),

	delete: workspaceProcedure
		.input(z.object({ ids: z.array(z.string()) }))
		.mutation(async ({ ctx, input }) => {
			const playlists = await dbHttp
				.update(Playlists)
				.set({
					deletedAt: sql`now()`,
					updatedAt: sql`now()`,
				})
				.where(
					and(
						sql`${Playlists.id} = ANY(${input.ids})`,
						eq(Playlists.workspaceId, ctx.workspace.id),
						isNull(Playlists.deletedAt),
					),
				)
				.returning();

			return playlists;
		}),
} satisfies TRPCRouterRecord;

export type PlaylistRoute = typeof playlistRoute;

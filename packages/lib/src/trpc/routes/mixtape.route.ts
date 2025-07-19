import type { InsertMixtape } from '@barely/validators';
import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { dbPool } from '@barely/db/pool';
import { _Mixtapes_To_Tracks, Mixtapes } from '@barely/db/sql/mixtape.sql';
import { sqlAnd, sqlStringContains } from '@barely/db/utils';
import { newId } from '@barely/utils';
import {
	createMixtapeSchema,
	insertMixtapeTracksSchema,
	selectWorkspaceMixtapesSchema,
	updateMixtapeSchema,
} from '@barely/validators';
import { and, asc, desc, eq, gt, inArray, isNull, lt, or, sql } from 'drizzle-orm';
import { z } from 'zod/v4';

import {
	getMixtapeById,
	getMixtapeWith_Tracks__fromRawMixtape,
} from '../../functions/mixtape.fns';
import { trackWith_workspace_genres_files } from '../../functions/track.fns';
import { privateProcedure, workspaceProcedure } from '../trpc';

export const mixtapeRoute = {
	byWorkspace: workspaceProcedure
		.input(selectWorkspaceMixtapesSchema)
		.query(async ({ input, ctx }) => {
			const { limit, cursor, search, showArchived } = input;

			const rawMixtapes = await dbHttp.query.Mixtapes.findMany({
				where: sqlAnd([
					eq(Mixtapes.workspaceId, ctx.workspace.id),
					showArchived ? undefined : isNull(Mixtapes.archivedAt),
					!!search.length && sqlStringContains(Mixtapes.name, search),
					!!cursor &&
						or(
							lt(Mixtapes.createdAt, cursor.createdAt),
							and(eq(Mixtapes.createdAt, cursor.createdAt), gt(Mixtapes.id, cursor.id)),
						),
				]),
				with: {
					_tracks: {
						orderBy: _tracks => [asc(_tracks.lexorank)],
						with: {
							track: {
								with: trackWith_workspace_genres_files,
							},
						},
					},
				},

				orderBy: [desc(Mixtapes.createdAt), desc(Mixtapes.id)],
				limit: limit + 1,
			});

			const mixtapes = rawMixtapes.map(getMixtapeWith_Tracks__fromRawMixtape);

			let nextCursor: typeof cursor | undefined = undefined;
			if (mixtapes.length > limit) {
				const nextMixtape = mixtapes.pop();
				nextCursor =
					nextMixtape ?
						{ id: nextMixtape.id, createdAt: nextMixtape.createdAt }
					:	undefined;
			}

			return {
				mixtapes,
				nextCursor,
			};
		}),

	byId: privateProcedure.input(z.string()).query(async ({ input, ctx }) => {
		const mixtape = await getMixtapeById(input, ctx.pool);

		return mixtape;
	}),

	create: workspaceProcedure
		.input(createMixtapeSchema)
		.mutation(async ({ input, ctx }) => {
			const { _tracks, ...mixtape } = input;

			const newMixtape = {
				...mixtape,
				id: newId('mixtape'),
				workspaceId: ctx.workspace.id,
			} satisfies InsertMixtape;

			await dbPool(ctx.pool).insert(Mixtapes).values(newMixtape);

			if (_tracks?.length) {
				await dbPool(ctx.pool)
					.insert(_Mixtapes_To_Tracks)
					.values(
						_tracks.map(track => ({
							mixtapeId: newMixtape.id,
							trackId: track.id,
							lexorank: track.lexorank,
						})),
					);
			}
		}),

	insertTracks: workspaceProcedure
		.input(
			z.object({
				mixtapeId: z.string(),
				_tracks: insertMixtapeTracksSchema,
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { mixtapeId, _tracks } = input;
			if (_tracks.length === 0) {
				return;
			}

			await dbPool(ctx.pool)
				.insert(_Mixtapes_To_Tracks)
				.values(
					_tracks.map(t => ({
						mixtapeId,
						trackId: t.id,
						lexorank: t.lexorank,
					})),
				);
		}),

	removeTracks: workspaceProcedure
		.input(
			z.object({
				mixtapeId: z.string(),
				trackIds: z.array(z.string()),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { mixtapeId, trackIds } = input;
			if (trackIds.length === 0) {
				return;
			}

			await dbPool(ctx.pool)
				.delete(_Mixtapes_To_Tracks)
				.where(
					and(
						eq(_Mixtapes_To_Tracks.mixtapeId, mixtapeId),
						inArray(_Mixtapes_To_Tracks.trackId, trackIds),
					),
				);
		}),

	update: workspaceProcedure
		.input(updateMixtapeSchema.omit({ _tracks: true }))
		.mutation(async ({ input, ctx }) => {
			await dbPool(ctx.pool).update(Mixtapes).set(input).where(eq(Mixtapes.id, input.id));
		}),

	reorderTracks: workspaceProcedure
		.input(
			z.object({
				mixtapeId: z.string(),
				_tracks: insertMixtapeTracksSchema,
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { mixtapeId, _tracks } = input;
			if (_tracks.length === 0) {
				return;
			}

			await dbPool(ctx.pool)
				.insert(_Mixtapes_To_Tracks)
				.values(
					_tracks.map(t => ({
						mixtapeId,
						trackId: t.id,
						lexorank: t.lexorank,
					})),
				)
				.onConflictDoUpdate({
					target: [_Mixtapes_To_Tracks.mixtapeId, _Mixtapes_To_Tracks.trackId],
					set: {
						lexorank: sql`EXCLUDED.lexorank`,
					},
				});
		}),

	// delete
	archive: workspaceProcedure
		.input(z.object({ ids: z.array(z.string()) }))
		.mutation(async ({ ctx, input }) => {
			await dbHttp
				.update(Mixtapes)
				.set({ archivedAt: new Date() })
				.where(
					and(
						eq(Mixtapes.workspaceId, ctx.workspace.id),
						inArray(Mixtapes.id, input.ids),
					),
				);
		}),

	delete: workspaceProcedure
		.input(z.object({ ids: z.array(z.string()) }))
		.mutation(async ({ input }) => {
			await dbHttp
				.update(Mixtapes)
				.set({ deletedAt: new Date() })
				.where(inArray(Mixtapes.id, input.ids));
		}),
} satisfies TRPCRouterRecord;

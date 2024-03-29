import { and, eq, inArray, sql } from 'drizzle-orm';
import { z } from 'zod';

import type { InsertMixtape } from './mixtape.schema';
import { getUserWorkspaceByHandle } from '../utils/auth';
import { newId } from '../utils/id';
import { createTRPCRouter, privateProcedure } from './api/trpc';
import { getMixtapeById, getMixtapesByWorkspaceId } from './mixtape.fns';
import {
	createMixtapeSchema,
	insertMixtapeTracksSchema,
	updateMixtapeSchema,
} from './mixtape.schema';
import { _Mixtapes_To_Tracks, Mixtapes } from './mixtape.sql';

export const mixtapeRouter = createTRPCRouter({
	byWorkspace: privateProcedure
		.input(z.object({ handle: z.string() }))
		.query(async ({ input, ctx }) => {
			const workspace = getUserWorkspaceByHandle(ctx.user, input.handle);
			const mixtapes = await getMixtapesByWorkspaceId(workspace.id, ctx.db);
			// console.log("mixtapes => ", mixtapes);
			return mixtapes;
		}),

	byId: privateProcedure.input(z.string()).query(async ({ input, ctx }) => {
		const mixtape = await getMixtapeById(input, ctx.db);

		return mixtape;
	}),

	create: privateProcedure.input(createMixtapeSchema).mutation(async ({ input, ctx }) => {
		const { _tracks, ...mixtape } = input;

		const newMixtape = {
			...mixtape,
			id: newId('mixtape'),
			workspaceId: ctx.workspace.id,
		} satisfies InsertMixtape;

		await ctx.db.pool.insert(Mixtapes).values(newMixtape);

		if (_tracks?.length) {
			await ctx.db.pool.insert(_Mixtapes_To_Tracks).values(
				_tracks.map(track => ({
					mixtapeId: newMixtape.id,
					trackId: track.id,
					lexorank: track.lexorank,
				})),
			);
		}
	}),

	insertTracks: privateProcedure
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

			await ctx.db.pool.insert(_Mixtapes_To_Tracks).values(
				_tracks.map(t => ({
					mixtapeId,
					trackId: t.id,
					lexorank: t.lexorank,
				})),
			);
		}),

	removeTracks: privateProcedure
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

			await ctx.db.pool
				.delete(_Mixtapes_To_Tracks)
				.where(
					and(
						eq(_Mixtapes_To_Tracks.mixtapeId, mixtapeId),
						inArray(_Mixtapes_To_Tracks.trackId, trackIds),
					),
				);
		}),

	update: privateProcedure
		.input(updateMixtapeSchema.omit({ _tracks: true }))
		.mutation(async ({ input, ctx }) => {
			await ctx.db.pool.update(Mixtapes).set(input).where(eq(Mixtapes.id, input.id));
		}),

	reorderTracks: privateProcedure
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

			await ctx.db.pool
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
	archive: privateProcedure
		.input(z.array(z.string()))
		.mutation(async ({ ctx, input }) => {
			await ctx.db.http
				.update(Mixtapes)
				.set({ archived: true })
				.where(
					and(eq(Mixtapes.workspaceId, ctx.workspace.id), inArray(Mixtapes.id, input)),
				);
		}),

	delete: privateProcedure.input(z.array(z.string())).mutation(async ({ ctx, input }) => {
		await ctx.db.http
			.update(Mixtapes)
			.set({ deletedAt: new Date().toISOString() })
			.where(inArray(Mixtapes.id, input));
	}),
});

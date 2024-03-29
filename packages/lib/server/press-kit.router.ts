import { and, eq, notInArray, sql } from 'drizzle-orm';
import { z } from 'zod';

import type { NormalizedPressKit } from './press-kit.schema';
import { getUserWorkspaceByHandle } from '../utils/auth';
import { newId } from '../utils/id';
import { raise } from '../utils/raise';
import { createTRPCRouter, privateProcedure } from './api/trpc';
import { _Files_To_PressKits_PressPhotos } from './file.sql';
import { defaultPressKit, updatePressKitSchema } from './press-kit.schema';
import { PressKits } from './press-kit.sql';
import { Workspaces } from './workspace.sql';

export const pressKitRouter = createTRPCRouter({
	byWorkspace: privateProcedure
		.input(z.object({ handle: z.string() }))
		.query(async ({ ctx, input }) => {
			const { id: workspaceId, handle } = getUserWorkspaceByHandle(
				ctx.user,
				input.handle,
			);

			const existingPressKit = await ctx.db.http.query.PressKits.findFirst({
				where: eq(PressKits.workspaceId, workspaceId),
				with: {
					_pressPhotos: {
						with: {
							file: true,
						},
					},
				},
			});

			if (existingPressKit) {
				const normalizedPressKit: NormalizedPressKit = {
					...existingPressKit,
					pressPhotos: existingPressKit._pressPhotos.map(_p => ({
						file: _p.file,
						lexorank: _p.lexorank,
					})),
				};

				existingPressKit.videos;
				normalizedPressKit.videos;

				return normalizedPressKit;
			}

			/* We need to create a new press kit */
			const newPressKitId = newId('pressKit');
			await ctx.db.http.insert(PressKits).values({
				...defaultPressKit,
				id: newPressKitId,
				workspaceId,
				handle,
			});

			const newPressKit = await ctx.db.http.query.PressKits.findFirst({
				where: eq(PressKits.workspaceId, workspaceId),
				with: {
					_pressPhotos: {
						with: {
							file: true,
						},
					},
				},
			}); // had trouble with type inference returning here. It only happens once per user so it's not a big deal

			const normalizedPressKit: NormalizedPressKit = {
				...(newPressKit ?? raise('Press kit not found')),
				pressPhotos: [],
			};

			normalizedPressKit.videos;

			return normalizedPressKit;
		}),

	update: privateProcedure
		.input(updatePressKitSchema)
		.mutation(async ({ ctx, input }) => {
			const { _workspace, _pressPhotos, ...updateValues } = input;

			await ctx.db.pool
				.update(PressKits)
				.set(updateValues)
				.where(eq(PressKits.id, input.id));

			/* joins */

			// workspace
			if (_workspace)
				await ctx.db.pool
					.update(Workspaces)
					.set(_workspace)
					.where(eq(Workspaces.id, ctx.workspace.id));

			// press photos
			if (_pressPhotos) {
				if (_pressPhotos.length === 0) {
					await ctx.db.pool
						.delete(_Files_To_PressKits_PressPhotos)
						.where(eq(_Files_To_PressKits_PressPhotos.pressKitId, input.id));
				} else {
					await ctx.db.pool.delete(_Files_To_PressKits_PressPhotos).where(
						and(
							eq(_Files_To_PressKits_PressPhotos.pressKitId, input.id),
							notInArray(
								_Files_To_PressKits_PressPhotos.fileId,
								_pressPhotos.map(p => p.fileId),
							),
						),
					);
					// insert any new joins
					await ctx.db.pool
						.insert(_Files_To_PressKits_PressPhotos)
						.values(
							_pressPhotos.map(p => ({
								pressKitId: input.id,
								fileId: p.fileId,
								lexorank: p.lexorank,
							})),
						)
						.onConflictDoUpdate({
							target: [
								_Files_To_PressKits_PressPhotos.pressKitId,
								_Files_To_PressKits_PressPhotos.fileId,
							],
							set: {
								lexorank: sql`EXCLUDED.lexorank`,
							},
						});
				}
			}
		}),
});

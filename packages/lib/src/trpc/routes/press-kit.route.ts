import type { NormalizedPressKit } from '@barely/validators';
import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { dbPool } from '@barely/db/pool';
import { _Files_To_PressKits_PressPhotos } from '@barely/db/sql/file.sql';
import { PressKits } from '@barely/db/sql/press-kit.sql';
import { Workspaces } from '@barely/db/sql/workspace.sql';
import { newId, raiseTRPCError } from '@barely/utils';
import { defaultPressKit, updatePressKitSchema } from '@barely/validators';
import { and, eq, notInArray, sql } from 'drizzle-orm';
import { z } from 'zod/v4';

import { getUserWorkspaceByHandle } from '@barely/auth/utils';

import { privateProcedure, workspaceProcedure } from '../trpc';

export const pressKitRoute = {
	byWorkspace: privateProcedure
		.input(z.object({ handle: z.string() }))
		.query(async ({ ctx, input }) => {
			const { id: workspaceId, handle } = getUserWorkspaceByHandle(
				ctx.user,
				input.handle,
			);

			const existingPressKit = await dbHttp.query.PressKits.findFirst({
				where: eq(PressKits.workspaceId, workspaceId),
				with: {
					_pressPhotos: {
						with: {
							file: true,
						},
					},
					workspace: {
						columns: {
							bio: true,
							bookingTitle: true,
							bookingName: true,
							bookingEmail: true,
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
					_workspace: {
						bio: existingPressKit.workspace.bio,
						bookingTitle: existingPressKit.workspace.bookingTitle,
						bookingName: existingPressKit.workspace.bookingName,
						bookingEmail: existingPressKit.workspace.bookingEmail,
					},
				};

				return normalizedPressKit;
			}

			/* We need to create a new press kit */
			const newPressKitId = newId('pressKit');
			await dbHttp.insert(PressKits).values({
				...defaultPressKit,
				id: newPressKitId,
				workspaceId,
				handle,
			});

			const newPressKit = await dbHttp.query.PressKits.findFirst({
				where: eq(PressKits.workspaceId, workspaceId),
				with: {
					_pressPhotos: {
						with: {
							file: true,
						},
					},
				},
			}); // had trouble with type inference returning here. It only happens once per user so it's not a big deal

			const workspace =
				(await dbHttp.query.Workspaces.findFirst({
					where: eq(Workspaces.id, workspaceId),
					columns: {
						bio: true,
						bookingTitle: true,
						bookingName: true,
						bookingEmail: true,
					},
				})) ?? raiseTRPCError({ message: 'Workspace not found' });

			const normalizedPressKit: NormalizedPressKit = {
				...(newPressKit ?? raiseTRPCError({ message: 'Press kit not found' })),
				pressPhotos: [],
				_workspace: {
					bio: workspace.bio,
					bookingTitle: workspace.bookingTitle,
					bookingName: workspace.bookingName,
					bookingEmail: workspace.bookingEmail,
				},
			};

			// normalizedPressKit.videos;

			return normalizedPressKit;
		}),

	update: workspaceProcedure
		.input(updatePressKitSchema)
		.mutation(async ({ ctx, input }) => {
			const { _workspace, _pressPhotos, ...updateValues } = input;

			await dbPool(ctx.pool)
				.update(PressKits)
				.set(updateValues)
				.where(eq(PressKits.id, input.id));

			/* joins */

			// workspace
			if (_workspace)
				await dbPool(ctx.pool)
					.update(Workspaces)
					.set(_workspace)
					.where(eq(Workspaces.id, ctx.workspace.id));

			// press photos
			if (_pressPhotos) {
				if (_pressPhotos.length === 0) {
					await dbPool(ctx.pool)
						.delete(_Files_To_PressKits_PressPhotos)
						.where(eq(_Files_To_PressKits_PressPhotos.pressKitId, input.id));
				} else {
					await dbPool(ctx.pool)
						.delete(_Files_To_PressKits_PressPhotos)
						.where(
							and(
								eq(_Files_To_PressKits_PressPhotos.pressKitId, input.id),
								notInArray(
									_Files_To_PressKits_PressPhotos.fileId,
									_pressPhotos.map(p => p.fileId),
								),
							),
						);
					// insert any new joins
					await dbPool(ctx.pool)
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
} satisfies TRPCRouterRecord;

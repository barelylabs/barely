import type { InsertVipSwap, UpdateVipSwap } from '@barely/validators';
import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { dbPool } from '@barely/db/pool';
import { VipSwapAccessLogs, VipSwaps } from '@barely/db/sql';
import { Files } from '@barely/db/sql/file.sql';
import { sqlAnd, sqlStringContains } from '@barely/db/utils';
import { newId, raiseTRPCError, sanitizeKey } from '@barely/utils';
import {
	createVipSwapSchema,
	selectWorkspaceVipSwapsSchema,
	updateVipSwapSchema,
} from '@barely/validators';
import { tasks, waitUntil } from '@trigger.dev/sdk/v3';
import { and, asc, desc, eq, gt, inArray, isNull, lt, or } from 'drizzle-orm';
import { z } from 'zod/v4';

import type { generateFileBlurHash } from '../../trigger';
import { workspaceProcedure } from '../trpc';

export const vipSwapRoute = {
	byWorkspace: workspaceProcedure
		.input(selectWorkspaceVipSwapsSchema)
		.query(async ({ input, ctx }) => {
			const { limit, cursor, search, showArchived, showDeleted } = input;

			const vipSwaps = await dbHttp.query.VipSwaps.findMany({
				with: {
					file: true,
					coverImage: true,
					accessLogs: {
						limit: 5,
						orderBy: [desc(VipSwapAccessLogs.createdAt)],
					},
				},
				where: sqlAnd([
					eq(VipSwaps.workspaceId, ctx.workspace.id),
					showArchived ? undefined : isNull(VipSwaps.archivedAt),
					showDeleted ? undefined : isNull(VipSwaps.deletedAt),
					!!search.length && sqlStringContains(VipSwaps.name, search),
					!!cursor &&
						or(
							lt(VipSwaps.createdAt, cursor.createdAt),
							and(eq(VipSwaps.createdAt, cursor.createdAt), gt(VipSwaps.id, cursor.id)),
						),
				]),

				orderBy: [desc(VipSwaps.createdAt), asc(VipSwaps.id)],
				limit: limit + 1,
			});

			let nextCursor: typeof cursor | undefined = undefined;

			if (vipSwaps.length > limit) {
				const nextSwap = vipSwaps.pop();
				if (nextSwap) {
					nextCursor = {
						id: nextSwap.id,
						createdAt: nextSwap.createdAt,
					};
				}
			}

			// check if cover image has blur hash
			for (const vipSwap of vipSwaps) {
				if (vipSwap.coverImage && !vipSwap.coverImage.blurDataUrl) {
					waitUntil(
						tasks.trigger<typeof generateFileBlurHash>('generate-file-blur-hash', {
							fileId: vipSwap.coverImage.id,
							s3Key: vipSwap.coverImage.s3Key,
						}),
					);
				}
			}

			return {
				vipSwaps,
				nextCursor,
			};
		}),

	byId: workspaceProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input, ctx }) => {
			const vipSwap = await dbHttp.query.VipSwaps.findFirst({
				where: and(
					eq(VipSwaps.id, input.id),
					eq(VipSwaps.workspaceId, ctx.workspace.id),
					isNull(VipSwaps.deletedAt),
				),
				with: {
					file: true,
					coverImage: true,
					accessLogs: {
						orderBy: [desc(VipSwapAccessLogs.createdAt)],
					},
				},
			});

			return vipSwap;
		}),

	create: workspaceProcedure
		.input(createVipSwapSchema)
		.mutation(async ({ input, ctx }) => {
			const { fileId, coverImageId, key, ...data } = input;

			// Check if slug already exists
			const existingSwap = await dbHttp.query.VipSwaps.findFirst({
				where: and(
					eq(VipSwaps.workspaceId, ctx.workspace.id),
					eq(VipSwaps.key, key),
					isNull(VipSwaps.deletedAt),
				),
			});

			if (existingSwap) {
				raiseTRPCError({ message: 'A swap with this slug already exists' });
			}

			// Verify file exists and belongs to workspace
			const file = await dbHttp.query.Files.findFirst({
				where: and(eq(Files.id, fileId), eq(Files.workspaceId, ctx.workspace.id)),
			});

			if (!file) {
				raiseTRPCError({
					message: 'File not found or does not belong to this workspace',
				});
			}

			// Verify cover image if provided
			if (coverImageId) {
				const coverImage = await dbHttp.query.Files.findFirst({
					where: and(eq(Files.id, coverImageId), eq(Files.workspaceId, ctx.workspace.id)),
				});

				if (!coverImage) {
					raiseTRPCError({
						message: 'Cover image not found or does not belong to this workspace',
					});
				}
			}

			const vipSwapData: InsertVipSwap = {
				...data,
				id: newId('vipSwap'),
				workspaceId: ctx.workspace.id,
				handle: ctx.workspace.handle,
				key: sanitizeKey(key),
				fileId,
				coverImageId: coverImageId ?? null,
			};

			const vipSwaps = await dbPool(ctx.pool)
				.insert(VipSwaps)
				.values(vipSwapData)
				.returning();

			const vipSwap =
				vipSwaps[0] ?? raiseTRPCError({ message: 'Failed to create VIP swap' });

			return vipSwap;
		}),

	update: workspaceProcedure
		.input(updateVipSwapSchema)
		.mutation(async ({ input, ctx }) => {
			const { id, fileId, coverImageId, key, ...data } = input;

			if (!id) {
				raiseTRPCError({ message: 'VIP swap ID is required' });
			}

			// Check if changing slug and if new slug exists
			if (key) {
				const existingSwap = await dbHttp.query.VipSwaps.findFirst({
					where: and(
						eq(VipSwaps.key, key),
						eq(VipSwaps.workspaceId, ctx.workspace.id),
						isNull(VipSwaps.deletedAt),
					),
				});

				if (existingSwap && existingSwap.id !== id) {
					raiseTRPCError({ message: 'A swap with this key already exists' });
				}
			}

			// Verify new file if provided
			if (fileId) {
				const file = await dbHttp.query.Files.findFirst({
					where: and(eq(Files.id, fileId), eq(Files.workspaceId, ctx.workspace.id)),
				});

				if (!file) {
					raiseTRPCError({
						message: 'File not found or does not belong to this workspace',
					});
				}
			}

			// Verify new cover image if provided
			if (coverImageId !== undefined && coverImageId !== null) {
				const coverImage = await dbHttp.query.Files.findFirst({
					where: and(eq(Files.id, coverImageId), eq(Files.workspaceId, ctx.workspace.id)),
				});

				if (!coverImage) {
					raiseTRPCError({
						message: 'Cover image not found or does not belong to this workspace',
					});
				}
			}

			const updateData: UpdateVipSwap = {
				id,
				...data,
				updatedAt: new Date(),
			};

			if (key !== undefined) {
				updateData.key = key;
			}

			if (fileId !== undefined) {
				updateData.fileId = fileId;
			}

			if (coverImageId !== undefined) {
				updateData.coverImageId = coverImageId;
			}

			const updatedSwaps = await dbPool(ctx.pool)
				.update(VipSwaps)
				.set(updateData)
				.where(and(eq(VipSwaps.id, id), eq(VipSwaps.workspaceId, ctx.workspace.id)))
				.returning();

			const updatedSwap =
				updatedSwaps[0] ?? raiseTRPCError({ message: 'Failed to update VIP swap' });

			return updatedSwap;
		}),

	archive: workspaceProcedure
		.input(z.object({ ids: z.array(z.string()) }))
		.mutation(async ({ input, ctx }) => {
			const updatedSwaps = await dbPool(ctx.pool)
				.update(VipSwaps)
				.set({ archivedAt: new Date() })
				.where(
					and(
						eq(VipSwaps.workspaceId, ctx.workspace.id),
						inArray(VipSwaps.id, input.ids),
					),
				)
				.returning();

			return updatedSwaps[0] ?? raiseTRPCError({ message: 'Failed to archive VIP swap' });
		}),

	delete: workspaceProcedure
		.input(z.object({ ids: z.array(z.string()) }))
		.mutation(async ({ input, ctx }) => {
			const updatedSwaps = await dbPool(ctx.pool)
				.update(VipSwaps)
				.set({ deletedAt: new Date() })
				.where(
					and(
						eq(VipSwaps.workspaceId, ctx.workspace.id),
						inArray(VipSwaps.id, input.ids),
					),
				)
				.returning();

			return updatedSwaps;
		}),

	toggleActive: workspaceProcedure
		.input(z.object({ id: z.string(), isActive: z.boolean() }))
		.mutation(async ({ input, ctx }) => {
			const updatedSwaps = await dbPool(ctx.pool)
				.update(VipSwaps)
				.set({
					isActive: input.isActive,
					updatedAt: new Date(),
				})
				.where(and(eq(VipSwaps.id, input.id), eq(VipSwaps.workspaceId, ctx.workspace.id)))
				.returning();

			const updatedSwap =
				updatedSwaps[0] ?? raiseTRPCError({ message: 'Failed to update VIP swap' });

			return updatedSwap;
		}),

	accessLogs: workspaceProcedure
		.input(
			z.object({
				vipSwapId: z.string(),
				limit: z.number().min(1).max(100).default(20),
				cursor: z
					.object({
						id: z.string(),
						createdAt: z.date(),
					})
					.optional(),
			}),
		)
		.query(async ({ input, ctx }) => {
			const { vipSwapId, limit, cursor } = input;

			// Verify the swap belongs to the workspace
			const swap = await dbHttp.query.VipSwaps.findFirst({
				where: and(
					eq(VipSwaps.id, vipSwapId),
					eq(VipSwaps.workspaceId, ctx.workspace.id),
				),
			});

			if (!swap) {
				raiseTRPCError({ message: 'VIP swap not found' });
			}

			const accessLogs = await dbHttp.query.VipSwapAccessLogs.findMany({
				where: sqlAnd([
					eq(VipSwapAccessLogs.vipSwapId, vipSwapId),
					!!cursor &&
						or(
							lt(VipSwapAccessLogs.createdAt, cursor.createdAt),
							and(
								eq(VipSwapAccessLogs.createdAt, cursor.createdAt),
								gt(VipSwapAccessLogs.id, cursor.id),
							),
						),
				]),
				orderBy: [desc(VipSwapAccessLogs.createdAt), asc(VipSwapAccessLogs.id)],
				limit: limit + 1,
			});

			let nextCursor: typeof cursor | undefined = undefined;

			if (accessLogs.length > limit) {
				const nextLog = accessLogs.pop();
				nextCursor =
					nextLog ?
						{
							id: nextLog.id,
							createdAt: nextLog.createdAt,
						}
					:	undefined;
			}

			return {
				accessLogs,
				nextCursor,
			};
		}),
} satisfies TRPCRouterRecord;

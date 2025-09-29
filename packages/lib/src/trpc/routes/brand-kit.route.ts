import type { InsertBrandKit } from '@barely/db/sql';
import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { BrandKits, Workspaces } from '@barely/db/sql';
import { newId } from '@barely/utils';
import { createBrandKitSchema, updateBrandKitSchema } from '@barely/validators';
import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';

import { workspaceProcedure } from '../trpc';

export const brandKitRouter = {
	// Get brand kit for current workspace
	current: workspaceProcedure.query(async ({ ctx }) => {
		const workspaceId = ctx.workspace.id;

		const brandKit = await dbHttp.query.BrandKits.findFirst({
			where: eq(BrandKits.workspaceId, workspaceId),
			with: {
				workspace: {
					columns: {
						name: true,
						handle: true,
					},
				},
			},
		});

		// If no brand kit exists, create one with defaults
		if (!brandKit) {
			const workspace = await dbHttp.query.Workspaces.findFirst({
				where: eq(Workspaces.id, workspaceId),
			});

			const newBrandKit: InsertBrandKit = {
				id: newId('brandKit'),
				workspaceId,
				handle: workspace?.handle ?? undefined,
				fontPreset: 'modern.cal',
				blockStyle: 'rounded',
				blockShadow: false,
				blockOutline: false,
				longBio: workspace?.bio ?? undefined,
				themeCategory: 'classic',
				colorPreset: 'basic-grayscale',
				colorScheme: {
					colors: ['#000000', '#808080', '#FFFFFF'],
					mapping: {
						backgroundColor: 2, // White background
						textColor: 0, // Black text
						buttonColor: 2, // White buttons
						buttonTextColor: 0, // Black button text
						buttonOutlineColor: 0, // Black outline
						blockColor: 2, // White blocks
						blockTextColor: 0, // Black block text
						bannerColor: 1, // Gray banner
					},
				},
				headingFont: 'modern.cal',
				bodyFont: 'modern.cal',
			};

			const [created] = await dbHttp.insert(BrandKits).values(newBrandKit).returning();

			if (!created) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to create brand kit',
				});
			}

			return { ...created, workspace: workspace };
		}

		return brandKit;
	}),

	// Create brand kit
	create: workspaceProcedure
		.input(createBrandKitSchema)
		.mutation(async ({ ctx, input }) => {
			const workspaceId = ctx.workspace.id;

			// Check if brand kit already exists
			const existing = await dbHttp.query.BrandKits.findFirst({
				where: eq(BrandKits.workspaceId, workspaceId),
			});

			if (existing) {
				throw new Error('Brand kit already exists for this workspace');
			}

			const [brandKit] = await dbHttp
				.insert(BrandKits)
				.values({
					id: newId('brandKit'),
					...input,
					workspaceId,
				})
				.returning();

			return brandKit;
		}),

	// Update brand kit
	update: workspaceProcedure
		.input(updateBrandKitSchema)
		.mutation(async ({ ctx, input }) => {
			const [updated] = await dbHttp
				.update(BrandKits)
				.set({
					...input,
					updatedAt: new Date(),
				})
				.where(
					and(eq(BrandKits.id, input.id), eq(BrandKits.workspaceId, ctx.workspace.id)),
				)
				.returning();

			if (!updated) {
				throw new Error('Failed to update brand kit');
			}

			return updated;
		}),
} satisfies TRPCRouterRecord;

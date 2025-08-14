import type { InsertBrandKit } from '@barely/db/sql';
import { dbHttp } from '@barely/db/client';
import { Bios, BrandKits, Workspaces } from '@barely/db/sql';
import { newId } from '@barely/utils';
import {
	brandKitByWorkspaceSchema,
	createBrandKitSchema,
	updateBrandKitSchema,
} from '@barely/validators';
import { eq } from 'drizzle-orm';

import { createTRPCRouter, privateProcedure, workspaceProcedure } from '../trpc';

export const brandKitRouter = createTRPCRouter({
	// Get brand kit for current workspace
	current: workspaceProcedure.query(async ({ ctx }) => {
		const workspaceId = ctx.workspace.id;

		const brandKit = await dbHttp.query.BrandKits.findFirst({
			where: eq(BrandKits.workspaceId, workspaceId),
		});

		// If no brand kit exists, create one with defaults
		if (!brandKit) {
			const workspace = await dbHttp.query.Workspaces.findFirst({
				where: eq(Workspaces.id, workspaceId),
			});

			const newBrandKit: InsertBrandKit = {
				id: newId('brandKit'),
				workspaceId,
				fontPreset: 'modern.cal',
				blockStyle: 'rounded',
				blockShadow: false,
				blockOutline: false,
				longBio: workspace?.bio ?? undefined,
			};

			const [created] = await dbHttp.insert(BrandKits).values(newBrandKit).returning();
			return created;
		}

		return brandKit;
	}),

	// Get brand kit by workspace ID (for public access)
	byWorkspaceId: privateProcedure
		.input(brandKitByWorkspaceSchema)
		.query(async ({ input }) => {
			const brandKit = await dbHttp.query.BrandKits.findFirst({
				where: eq(BrandKits.workspaceId, input.workspaceId),
			});

			// If no brand kit exists, return defaults
			if (!brandKit) {
				return {
					workspaceId: input.workspaceId,
					fontPreset: 'modern.cal',
					blockStyle: 'rounded',
					blockShadow: false,
					blockOutline: false,
				} as const;
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
			const workspaceId = ctx.workspace.id;

			// Ensure brand kit exists
			const existing = await dbHttp.query.BrandKits.findFirst({
				where: eq(BrandKits.workspaceId, workspaceId),
			});

			if (!existing) {
				// Create if doesn't exist
				const { id: _id, ...inputWithoutId } = input; // Remove id from input if present
				const [brandKit] = await dbHttp
					.insert(BrandKits)
					.values({
						id: newId('brandKit'),
						...inputWithoutId,
						workspaceId,
					})
					.returning();
				return brandKit;
			}

			// Update existing
			const [updated] = await dbHttp
				.update(BrandKits)
				.set({
					...input,
					updatedAt: new Date(),
				})
				.where(eq(BrandKits.id, existing.id))
				.returning();

			return updated;
		}),

	// Migrate bio settings to brand kit (one-time migration)
	migrateFromBio: workspaceProcedure.mutation(async ({ ctx }) => {
		const workspaceId = ctx.workspace.id;

		// Check if brand kit already exists
		const existing = await dbHttp.query.BrandKits.findFirst({
			where: eq(BrandKits.workspaceId, workspaceId),
		});

		if (existing) {
			return existing; // Already migrated
		}

		// Get bio for this workspace
		const bio = await dbHttp.query.Bios.findFirst({
			where: eq(Bios.workspaceId, workspaceId),
		});

		if (!bio) {
			// Get workspace bio field for migration
			const workspace = await dbHttp.query.Workspaces.findFirst({
				where: eq(Workspaces.id, workspaceId),
				columns: {
					bio: true,
				},
			});

			// No bio to migrate from, create defaults
			const [brandKit] = await dbHttp
				.insert(BrandKits)
				.values({
					id: newId('brandKit'),
					workspaceId,
					longBio: workspace?.bio ?? undefined,
					fontPreset: 'modern.cal',
					blockStyle: 'rounded',
					blockShadow: false,
					blockOutline: false,
				})
				.returning();
			return brandKit;
		}

		// Get workspace bio field for migration
		const workspace = await dbHttp.query.Workspaces.findFirst({
			where: eq(Workspaces.id, workspaceId),
			columns: {
				bio: true,
			},
		});

		// Create brand kit with default values
		// Most bio fields have been removed, so we use defaults
		const [brandKit] = await dbHttp
			.insert(BrandKits)
			.values({
				id: newId('brandKit'),
				workspaceId,
				longBio: workspace?.bio ?? undefined,
				// Set default values since most bio fields have been removed
				fontPreset: 'modern.cal',
				blockStyle: 'rounded',
				blockShadow: bio.blockShadow,
				blockOutline: false,
			})
			.returning();

		return brandKit;
	}),
});

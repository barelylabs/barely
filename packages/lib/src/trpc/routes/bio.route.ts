import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { dbPool } from '@barely/db/pool';
import {
	_BioBlocks_To_Bios,
	_BioButtons_To_Bios,
	_BioLinks_To_BioBlocks,
	_Files_To_BioLinks__Images,
	BioBlocks,
	BioButtons,
	BioLinks,
	Bios,
	CartFunnels,
	Files,
	Links,
} from '@barely/db/sql';
import { sqlAnd, sqlStringContains } from '@barely/db/utils';
import { newId, raiseTRPCError } from '@barely/utils';
import {
	createBioButtonSchema,
	createBioLinkSchema,
	createBioSchema,
	createCartBlockDataSchema,
	createContactFormBlockDataSchema,
	createImageBlockDataSchema,
	createLinksBlockDataSchema,
	createMarkdownBlockDataSchema,
	createTwoPanelBlockDataSchema,
	reorderBioBlocksSchema,
	reorderBioLinksSchema,
	selectInfiniteBiosSchema,
	updateBioBlockSchema,
	updateBioButtonSchema,
	updateBioLinkSchema,
	updateBioSchema,
} from '@barely/validators';
import { tasks } from '@trigger.dev/sdk/v3';
import { TRPCError } from '@trpc/server';
import { waitUntil } from '@vercel/functions';
import { and, asc, desc, eq, gt, inArray, isNull, lt, or } from 'drizzle-orm';
import { z } from 'zod/v4';

import type { generateFileBlurHash } from '../../trigger/file-blurhash.trigger';
import {
	getBioBlocksByHandleAndKey,
	getBioByHandleAndKey,
} from '../../functions/bio.fns';
import { generateLexoRank } from '../../functions/lexo-rank.fns';
import { detectLinkType, formatLinkUrl } from '../../functions/link-type.fns';
import { workspaceProcedure } from '../trpc';

export const bioRoute = {
	byKey: workspaceProcedure
		.input(
			z.object({
				key: z.string().default('home'),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { key } = input;
			// Find existing bio or create one if it doesn't exist
			let bio = await getBioByHandleAndKey({
				handle: ctx.workspace.handle,
				key,
			});

			// If no bio exists, create one with defaults and a default links block
			if (!bio && key === 'home') {
				const bioId = newId('bio');
				const blockId = newId('bioBlock');

				// Create bio with transaction-like error handling
				try {
					await dbPool(ctx.pool).insert(Bios).values({
						id: bioId,
						workspaceId: ctx.workspace.id,
						handle: ctx.workspace.handle,
						key,
						socialDisplay: false,
						barelyBranding: true,
						emailCaptureEnabled: false,
					});

					// Create default links block
					await dbPool(ctx.pool).insert(BioBlocks).values({
						id: blockId,
						workspaceId: ctx.workspace.id,
						type: 'links',
						enabled: true,
					});

					// Connect block to bio
					const firstLexoRank = generateLexoRank({ prev: null, next: null });
					await dbPool(ctx.pool).insert(_BioBlocks_To_Bios).values({
						bioId,
						bioBlockId: blockId,
						lexoRank: firstLexoRank,
					});
				} catch (error) {
					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: 'Failed to create bio with default block',
						cause: error,
					});
				}

				bio = await getBioByHandleAndKey({
					handle: ctx.workspace.handle,
					key: input.key,
				});

				if (!bio) {
					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: 'Failed to retrieve bio after creation',
					});
				}
			}

			if (!bio) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Bio not found',
				});
			}

			return bio;
		}),

	byWorkspace: workspaceProcedure
		.input(selectInfiniteBiosSchema)
		.query(async ({ input, ctx }) => {
			const { limit, cursor, search, showArchived } = input;

			const bios = await dbHttp.query.Bios.findMany({
				with: {
					bioButtons: {
						with: {
							bioButton: {
								with: {
									link: true,
									form: true,
								},
							},
						},
						orderBy: [asc(_BioButtons_To_Bios.lexoRank)],
					},
				},
				where: sqlAnd([
					eq(Bios.workspaceId, ctx.workspace.id),
					showArchived ? undefined : isNull(Bios.archivedAt),
					isNull(Bios.deletedAt),
					!!search && sqlStringContains(Bios.handle, search),
					!!cursor &&
						or(
							lt(Bios.createdAt, cursor.createdAt),
							and(eq(Bios.createdAt, cursor.createdAt), gt(Bios.id, cursor.id)),
						),
				]),
				orderBy: [desc(Bios.createdAt), asc(Bios.id)],
				limit: limit + 1,
			});

			let nextCursor: typeof cursor | undefined = undefined;

			if (bios.length > limit) {
				const nextBio = bios.pop();
				nextCursor =
					nextBio ?
						{
							id: nextBio.id,
							createdAt: nextBio.createdAt,
						}
					:	undefined;
			}

			// Transform to flatten button structure
			const transformedBios = bios.map(bio => ({
				...bio,
				buttons: bio.bioButtons
					.map(bb => ({
						...bb.bioButton,
						lexoRank: bb.lexoRank,
						link:
							bb.bioButton.link ?
								{
									id: bb.bioButton.link.id,
									url: bb.bioButton.link.url,
									domain: bb.bioButton.link.domain,
								}
							:	undefined,
					}))
					.sort((a, b) => a.lexoRank.localeCompare(b.lexoRank)),
			}));

			return {
				bios: transformedBios,
				nextCursor,
			};
		}),

	blocksByHandleAndKey: workspaceProcedure
		.input(z.object({ handle: z.string(), key: z.string() }))
		.query(async ({ input, ctx }) => {
			const blocks = await getBioBlocksByHandleAndKey({
				handle: ctx.workspace.handle,
				key: input.key,
			});

			if (!blocks.length) {
				const bio = await getBioByHandleAndKey({
					handle: ctx.workspace.handle,
					key: input.key,
				});

				if (!bio) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Bio not found',
					});
				}

				return []; // todo initialize with default block(s)
			}

			return blocks;
		}),

	byId: workspaceProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input, ctx }) => {
			const bio = await dbHttp.query.Bios.findFirst({
				where: and(eq(Bios.id, input.id), eq(Bios.workspaceId, ctx.workspace.id)),
				with: {
					bioButtons: {
						with: {
							bioButton: {
								with: {
									link: true,
									form: true,
								},
							},
						},
						orderBy: [asc(_BioButtons_To_Bios.lexoRank)],
					},
				},
			});

			if (!bio) return null;

			// Transform to flatten button structure
			return {
				...bio,
				buttons: bio.bioButtons
					.map(bb => ({
						...bb.bioButton,
						lexoRank: bb.lexoRank,
						link:
							bb.bioButton.link ?
								{
									id: bb.bioButton.link.id,
									url: bb.bioButton.link.url,
									domain: bb.bioButton.link.domain,
								}
							:	undefined,
					}))
					.sort((a, b) => a.lexoRank.localeCompare(b.lexoRank)),
			};
		}),

	create: workspaceProcedure.input(createBioSchema).mutation(async ({ input, ctx }) => {
		const bioId = newId('bio');

		const [bio] = await dbPool(ctx.pool)
			.insert(Bios)
			.values({
				...input,
				id: bioId,
				workspaceId: ctx.workspace.id,
				handle: ctx.workspace.handle,
			})
			.returning();

		return bio ?? raiseTRPCError({ message: 'Failed to create bio' });
	}),

	update: workspaceProcedure
		.input(updateBioSchema.extend({ handle: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const { id, ...data } = input;

			const [updatedBio] = await dbPool(ctx.pool)
				.update(Bios)
				.set(data)
				.where(and(eq(Bios.id, id), eq(Bios.workspaceId, ctx.workspace.id)))
				.returning();

			return updatedBio ?? raiseTRPCError({ message: 'Failed to update bio' });
		}),

	archive: workspaceProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const [archivedBio] = await dbPool(ctx.pool)
				.update(Bios)
				.set({ archivedAt: new Date() })
				.where(and(eq(Bios.id, input.id), eq(Bios.workspaceId, ctx.workspace.id)))
				.returning();

			return archivedBio ?? raiseTRPCError({ message: 'Failed to archive bio' });
		}),

	unarchive: workspaceProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const [unarchivedBio] = await dbPool(ctx.pool)
				.update(Bios)
				.set({ archivedAt: null })
				.where(and(eq(Bios.id, input.id), eq(Bios.workspaceId, ctx.workspace.id)))
				.returning();

			return unarchivedBio ?? raiseTRPCError({ message: 'Failed to unarchive bio' });
		}),

	delete: workspaceProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const [deletedBio] = await dbPool(ctx.pool)
				.update(Bios)
				.set({ deletedAt: new Date() })
				.where(and(eq(Bios.id, input.id), eq(Bios.workspaceId, ctx.workspace.id)))
				.returning();

			return deletedBio ?? raiseTRPCError({ message: 'Failed to delete bio' });
		}),

	// Bio Button operations
	addButton: workspaceProcedure
		.input(
			createBioButtonSchema.extend({
				bioId: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { bioId, ...buttonData } = input;

			// Verify bio belongs to workspace
			const bio = await dbHttp.query.Bios.findFirst({
				where: and(eq(Bios.id, bioId), eq(Bios.workspaceId, ctx.workspace.id)),
			});

			if (!bio) raiseTRPCError({ message: 'Bio not found' });

			// Get the last button's lexoRank to generate next rank
			const lastButton = await dbHttp.query._BioButtons_To_Bios.findFirst({
				where: eq(_BioButtons_To_Bios.bioId, bioId),
				orderBy: [desc(_BioButtons_To_Bios.lexoRank)],
			});

			const lexoRank = generateLexoRank({
				prev: lastButton?.lexoRank ?? null,
				next: null,
			});

			const buttonId = newId('bioButton');

			// Create the button
			const [button] = await dbPool(ctx.pool)
				.insert(BioButtons)
				.values({
					...buttonData,
					id: buttonId,
					workspaceId: ctx.workspace.id,
				})
				.returning();

			if (!button) raiseTRPCError({ message: 'Failed to create button' });

			// Create the relationship
			await dbPool(ctx.pool).insert(_BioButtons_To_Bios).values({
				bioId,
				bioButtonId: buttonId,
				lexoRank,
			});

			return button;
		}),

	updateButton: workspaceProcedure
		.input(updateBioButtonSchema)
		.mutation(async ({ input, ctx }) => {
			const { id, ...data } = input;

			const [updatedButton] = await dbPool(ctx.pool)
				.update(BioButtons)
				.set(data)
				.where(and(eq(BioButtons.id, id), eq(BioButtons.workspaceId, ctx.workspace.id)))
				.returning();

			return updatedButton ?? raiseTRPCError({ message: 'Failed to update button' });
		}),

	removeButton: workspaceProcedure
		.input(
			z.object({
				bioId: z.string(),
				buttonId: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			// Verify bio belongs to workspace
			const bio = await dbHttp.query.Bios.findFirst({
				where: and(eq(Bios.id, input.bioId), eq(Bios.workspaceId, ctx.workspace.id)),
			});

			if (!bio) raiseTRPCError({ message: 'Bio not found' });

			// Remove the relationship
			await dbPool(ctx.pool)
				.delete(_BioButtons_To_Bios)
				.where(
					and(
						eq(_BioButtons_To_Bios.bioId, input.bioId),
						eq(_BioButtons_To_Bios.bioButtonId, input.buttonId),
					),
				);

			// Delete the button itself
			await dbPool(ctx.pool)
				.delete(BioButtons)
				.where(
					and(
						eq(BioButtons.id, input.buttonId),
						eq(BioButtons.workspaceId, ctx.workspace.id),
					),
				);

			return { success: true };
		}),

	// reorderButtons: workspaceProcedure
	// 	.input(reorderBioButtonsSchema)
	// 	.mutation(async ({ input, ctx }) => {
	// 		const { bioId, buttonIds } = input;

	// 		// Verify bio belongs to workspace
	// 		const bio = await dbHttp.query.Bios.findFirst({
	// 			where: and(eq(Bios.id, bioId), eq(Bios.workspaceId, ctx.workspace.id)),
	// 		});

	// 		if (!bio) raiseTRPCError({ message: 'Bio not found' });

	// 		// Get current buttons with their lexoRanks to maintain valid ordering
	// 		const currentButtons = await dbHttp.query._BioButtons_To_Bios.findMany({
	// 			where: eq(_BioButtons_To_Bios.bioId, bioId),
	// 			orderBy: [asc(_BioButtons_To_Bios.lexoRank)],
	// 		});

	// 		// Create a map of current lexoRanks for reference
	// 		const currentRankMap = new Map(
	// 			currentButtons.map(b => [b.bioButtonId, b.lexoRank]),
	// 		);

	// 		// Generate new lexoRanks for the ordered buttons
	// 		const newRanks: string[] = [];
	// 		for (let i = 0; i < buttonIds.length; i++) {
	// 			let lexoRank: string;

	// 			if (i === 0) {
	// 				// First item
	// 				const nextButtonId = buttonIds[i + 1];
	// 				const nextRank =
	// 					nextButtonId ? (currentRankMap.get(nextButtonId) ?? null) : null;
	// 				lexoRank = generateLexoRank({ prev: null, next: nextRank });
	// 			} else if (i === buttonIds.length - 1) {
	// 				// Last item
	// 				const prevRank = newRanks[i - 1] ?? null;
	// 				lexoRank = generateLexoRank({ prev: prevRank, next: null });
	// 			} else {
	// 				// Middle item - between previous new rank and next current rank
	// 				const nextButtonId = buttonIds[i + 1];
	// 				const nextRank =
	// 					nextButtonId ? (currentRankMap.get(nextButtonId) ?? null) : null;
	// 				const prevRank = newRanks[i - 1] ?? null;
	// 				lexoRank = generateLexoRank({
	// 					prev: prevRank,
	// 					next: nextRank,
	// 				});
	// 			}

	// 			newRanks.push(lexoRank);
	// 		}

	// 		// Update all buttons with their new ranks
	// 		const updates = buttonIds.map((buttonId, index) => {
	// 			return dbPool(ctx.pool)
	// 				.update(_BioButtons_To_Bios)
	// 				.set({ lexoRank: newRanks[index] })
	// 				.where(
	// 					and(
	// 						eq(_BioButtons_To_Bios.bioId, bioId),
	// 						eq(_BioButtons_To_Bios.bioButtonId, buttonId),
	// 					),
	// 				);
	// 		});

	// 		await Promise.all(updates);

	// 		return { success: true };
	// 	}),

	// Get button suggestions based on workspace data
	// getButtonSuggestions: workspaceProcedure
	// 	.input(z.object({ bioId: z.string().optional() }))
	// 	.query(async ({ ctx }) => {
	// 		// Fetch workspace data for suggestions
	// 		const [links, tracks, workspace] = await Promise.all([
	// 			dbHttp.query.Links.findMany({
	// 				where: eq(Links.workspaceId, ctx.workspace.id),
	// 				orderBy: [desc(Links.clicks)],
	// 				limit: 10,
	// 			}),
	// 			dbHttp.query.Tracks.findMany({
	// 				where: eq(Tracks.workspaceId, ctx.workspace.id),
	// 				orderBy: [desc(Tracks.createdAt)],
	// 				limit: 5,
	// 			}),
	// 			dbHttp.query.Workspaces.findFirst({
	// 				where: eq(Workspaces.id, ctx.workspace.id),
	// 				columns: {
	// 					spotifyArtistId: true,
	// 					instagramUsername: true,
	// 					tiktokUsername: true,
	// 					youtubeChannelId: true,
	// 				},
	// 			}),
	// 		]);

	// 		const suggestions = generateBioButtonSuggestions({
	// 			links,
	// 			tracks,
	// 			spotifyArtistId: workspace?.spotifyArtistId,
	// 			instagramUsername: workspace?.instagramUsername,
	// 			tiktokUsername: workspace?.tiktokUsername,
	// 			youtubeChannelId: workspace?.youtubeChannelId,
	// 		});

	// 		return suggestions;
	// 	}),

	// Detect link type from URL
	detectLinkType: workspaceProcedure
		.input(z.object({ url: z.string() }))
		.query(({ input }) => {
			const type = detectLinkType(input.url);
			const formattedUrl = formatLinkUrl(input.url, type);

			return {
				type,
				formattedUrl,
				originalUrl: input.url,
			};
		}),

	// Bio Block operations
	createBlock: workspaceProcedure
		.input(
			z.discriminatedUnion('type', [
				createLinksBlockDataSchema,
				createContactFormBlockDataSchema,
				createMarkdownBlockDataSchema,
				createImageBlockDataSchema,
				createTwoPanelBlockDataSchema,
				createCartBlockDataSchema,
			]),
		)
		.mutation(async ({ input, ctx }) => {
			const { bioId, ...blockData } = input;

			// Map the CTA fields to the generic database columns
			// const blockData = {
			// 	...restBlockData,
			// 	// For twoPanel blocks, map CTA targets to generic columns
			// 	...(input.type === 'twoPanel' && {
			// 		bioRefId, // Maps CTA bio target to bioId column
			// 		cartFunnelId, // Maps CTA cart target to cartFunnelId column
			// 		// linkId and fmId are already named correctly
			// 	}),
			// };

			// Verify bio belongs to workspace
			const bio = await dbHttp.query.Bios.findFirst({
				where: and(eq(Bios.id, bioId), eq(Bios.workspaceId, ctx.workspace.id)),
			});

			if (!bio) raiseTRPCError({ message: 'Bio not found' });

			// Validate foreign key references based on block type
			if (blockData.type === 'image' || blockData.type === 'twoPanel') {
				if (blockData.imageFileId) {
					const file = await dbHttp.query.Files.findFirst({
						where: and(
							eq(Files.id, blockData.imageFileId),
							eq(Files.workspaceId, ctx.workspace.id),
						),
					});
					if (!file) raiseTRPCError({ message: 'Image file not found' });
				}
			}

			// Validate CTA target references for twoPanel blocks
			if (blockData.type === 'twoPanel') {
				if (blockData.targetLinkId) {
					const link = await dbHttp.query.Links.findFirst({
						where: and(
							eq(Links.id, blockData.targetLinkId),
							eq(Links.workspaceId, ctx.workspace.id),
						),
					});
					if (!link) raiseTRPCError({ message: 'CTA link not found' });
				}

				if (blockData.targetBioId) {
					const targetBio = await dbHttp.query.Bios.findFirst({
						where: and(
							eq(Bios.id, blockData.targetBioId),
							eq(Bios.workspaceId, ctx.workspace.id),
						),
					});
					if (!targetBio) raiseTRPCError({ message: 'Target bio not found' });
				}

				// Note: fmId validation would go here once FM table is available
			}

			if (blockData.type === 'cart' && blockData.targetCartFunnelId) {
				const cartFunnel = await dbHttp.query.CartFunnels.findFirst({
					where: and(
						eq(CartFunnels.id, blockData.targetCartFunnelId),
						eq(CartFunnels.workspaceId, ctx.workspace.id),
					),
				});
				if (!cartFunnel) raiseTRPCError({ message: 'Cart funnel not found' });
			}

			// Get the last block's lexoRank to generate next rank
			const lastBlock = await dbHttp.query._BioBlocks_To_Bios.findFirst({
				where: eq(_BioBlocks_To_Bios.bioId, bioId),
				orderBy: [desc(_BioBlocks_To_Bios.lexoRank)],
			});

			const lexoRank = generateLexoRank({
				prev: lastBlock?.lexoRank ?? null,
				next: null,
			});

			const blockId = newId('bioBlock');

			// Create the block
			const [block] = await dbPool(ctx.pool)
				.insert(BioBlocks)
				.values({
					...blockData,
					id: blockId,
					workspaceId: ctx.workspace.id,
				})
				.returning();

			if (!block) raiseTRPCError({ message: 'Failed to create block' });

			// Create the relationship
			await dbPool(ctx.pool).insert(_BioBlocks_To_Bios).values({
				bioId,
				// handle: ctx.workspace.handle,
				// key:
				// 	bio?.key ??
				// 	raiseTRPCError({
				// 		code: 'INTERNAL_SERVER_ERROR',
				// 		message: 'Bio key not found',
				// 	}),
				bioBlockId: blockId,
				lexoRank,
			});

			return block;
		}),

	updateBlock: workspaceProcedure
		.input(updateBioBlockSchema)
		.mutation(async ({ input, ctx }) => {
			const { id, ...data } = input;

			// Get the existing block to check its type
			const existingBlock = await dbHttp.query.BioBlocks.findFirst({
				where: and(eq(BioBlocks.id, id), eq(BioBlocks.workspaceId, ctx.workspace.id)),
			});

			if (!existingBlock) raiseTRPCError({ message: 'Block not found' });

			// Validate foreign key references if they're being updated
			if (data.imageFileId) {
				const file = await dbHttp.query.Files.findFirst({
					where: and(
						eq(Files.id, data.imageFileId),
						eq(Files.workspaceId, ctx.workspace.id),
					),
				});
				if (!file) raiseTRPCError({ message: 'Image file not found' });
			}

			if (data.linkId) {
				const link = await dbHttp.query.Links.findFirst({
					where: and(eq(Links.id, data.linkId), eq(Links.workspaceId, ctx.workspace.id)),
				});
				if (!link) raiseTRPCError({ message: 'Link not found' });
			}

			if (data.bioId) {
				const targetBio = await dbHttp.query.Bios.findFirst({
					where: and(eq(Bios.id, data.bioId), eq(Bios.workspaceId, ctx.workspace.id)),
				});
				if (!targetBio) raiseTRPCError({ message: 'Target bio not found' });
			}

			if (data.targetCartFunnelId) {
				const cartFunnel = await dbHttp.query.CartFunnels.findFirst({
					where: and(
						eq(CartFunnels.id, data.targetCartFunnelId),
						eq(CartFunnels.workspaceId, ctx.workspace.id),
					),
				});
				if (!cartFunnel) raiseTRPCError({ message: 'Cart funnel not found' });
			}

			const [updatedBlock] = await dbPool(ctx.pool)
				.update(BioBlocks)
				.set(data)
				.where(and(eq(BioBlocks.id, id), eq(BioBlocks.workspaceId, ctx.workspace.id)))
				.returning();

			return updatedBlock ?? raiseTRPCError({ message: 'Failed to update block' });
		}),

	deleteBlock: workspaceProcedure
		.input(
			z.object({
				bioId: z.string(),
				blockId: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			// Verify bio belongs to workspace
			const bio = await dbHttp.query.Bios.findFirst({
				where: and(eq(Bios.id, input.bioId), eq(Bios.workspaceId, ctx.workspace.id)),
			});

			if (!bio) raiseTRPCError({ message: 'Bio not found' });

			// Remove the relationship
			await dbPool(ctx.pool)
				.delete(_BioBlocks_To_Bios)
				.where(
					and(
						eq(_BioBlocks_To_Bios.bioId, input.bioId),
						eq(_BioBlocks_To_Bios.bioBlockId, input.blockId),
					),
				);

			// Delete the block itself (this will cascade delete associated links)
			await dbPool(ctx.pool)
				.delete(BioBlocks)
				.where(
					and(
						eq(BioBlocks.id, input.blockId),
						eq(BioBlocks.workspaceId, ctx.workspace.id),
					),
				);

			return { success: true };
		}),

	reorderBlocks: workspaceProcedure
		.input(reorderBioBlocksSchema)
		.mutation(async ({ input, ctx }) => {
			const { bioId, blockIds } = input;

			// Verify bio belongs to workspace
			const bio = await dbHttp.query.Bios.findFirst({
				where: and(eq(Bios.id, bioId), eq(Bios.workspaceId, ctx.workspace.id)),
			});

			if (!bio) raiseTRPCError({ message: 'Bio not found' });

			// Get current blocks with their lexoRanks to maintain valid ordering
			const currentBlocks = await dbHttp.query._BioBlocks_To_Bios.findMany({
				where: eq(_BioBlocks_To_Bios.bioId, bioId),
				orderBy: [asc(_BioBlocks_To_Bios.lexoRank)],
			});

			// Create a map of current lexoRanks for reference
			const currentRankMap = new Map(currentBlocks.map(b => [b.bioBlockId, b.lexoRank]));

			// Generate new lexoRanks for the ordered blocks
			const newRanks: string[] = [];
			for (let i = 0; i < blockIds.length; i++) {
				let lexoRank: string;

				if (i === 0) {
					// First item
					const nextBlockId = blockIds[i + 1];
					const nextRank = nextBlockId ? (currentRankMap.get(nextBlockId) ?? null) : null;
					lexoRank = generateLexoRank({ prev: null, next: nextRank });
				} else if (i === blockIds.length - 1) {
					// Last item
					const prevRank = newRanks[i - 1] ?? null;
					lexoRank = generateLexoRank({ prev: prevRank, next: null });
				} else {
					// Middle item - between previous new rank and next current rank
					const nextBlockId = blockIds[i + 1];
					const nextRank = nextBlockId ? (currentRankMap.get(nextBlockId) ?? null) : null;
					const prevRank = newRanks[i - 1] ?? null;
					lexoRank = generateLexoRank({
						prev: prevRank,
						next: nextRank,
					});
				}

				newRanks.push(lexoRank);
			}

			// Update all blocks with their new ranks
			const updates = blockIds.map((blockId, index) => {
				return dbPool(ctx.pool)
					.update(_BioBlocks_To_Bios)
					.set({ lexoRank: newRanks[index] })
					.where(
						and(
							eq(_BioBlocks_To_Bios.bioId, bioId),
							eq(_BioBlocks_To_Bios.bioBlockId, blockId),
						),
					);
			});

			await Promise.all(updates);

			return { success: true };
		}),

	// Bio Link operations (links within blocks)
	createLink: workspaceProcedure
		.input(
			createBioLinkSchema.extend({
				blockId: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { blockId, ...linkData } = input;

			// Verify block belongs to workspace
			const block = await dbHttp.query.BioBlocks.findFirst({
				where: and(
					eq(BioBlocks.id, blockId),
					eq(BioBlocks.workspaceId, ctx.workspace.id),
				),
			});

			if (!block) raiseTRPCError({ message: 'Block not found' });

			// Get the last link's lexoRank to generate next rank
			const lastLink = await dbHttp.query._BioLinks_To_BioBlocks.findFirst({
				where: eq(_BioLinks_To_BioBlocks.bioBlockId, blockId),
				orderBy: [desc(_BioLinks_To_BioBlocks.lexoRank)],
			});

			const lexoRank = generateLexoRank({
				prev: lastLink?.lexoRank ?? null,
				next: null,
			});

			const linkId = newId('bioLink');

			// Create the link
			const [link] = await dbPool(ctx.pool)
				.insert(BioLinks)
				.values({
					...linkData,
					id: linkId,
					workspaceId: ctx.workspace.id,
				})
				.returning();

			if (!link) raiseTRPCError({ message: 'Failed to create link' });

			// Create the relationship
			await dbPool(ctx.pool).insert(_BioLinks_To_BioBlocks).values({
				bioBlockId: blockId,
				bioLinkId: linkId,
				lexoRank,
			});

			return link;
		}),

	updateLink: workspaceProcedure
		.input(updateBioLinkSchema)
		.mutation(async ({ input, ctx }) => {
			const { id, ...data } = input;

			const [updatedLink] = await dbPool(ctx.pool)
				.update(BioLinks)
				.set(data)
				.where(and(eq(BioLinks.id, id), eq(BioLinks.workspaceId, ctx.workspace.id)))
				.returning();

			return updatedLink ?? raiseTRPCError({ message: 'Failed to update link' });
		}),

	deleteLink: workspaceProcedure
		.input(
			z.object({
				blockId: z.string(),
				linkId: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			// Verify block belongs to workspace
			const block = await dbHttp.query.BioBlocks.findFirst({
				where: and(
					eq(BioBlocks.id, input.blockId),
					eq(BioBlocks.workspaceId, ctx.workspace.id),
				),
			});

			if (!block) raiseTRPCError({ message: 'Block not found' });

			// Remove the relationship
			await dbPool(ctx.pool)
				.delete(_BioLinks_To_BioBlocks)
				.where(
					and(
						eq(_BioLinks_To_BioBlocks.bioBlockId, input.blockId),
						eq(_BioLinks_To_BioBlocks.bioLinkId, input.linkId),
					),
				);

			// Delete the link itself
			await dbPool(ctx.pool)
				.delete(BioLinks)
				.where(
					and(eq(BioLinks.id, input.linkId), eq(BioLinks.workspaceId, ctx.workspace.id)),
				);

			return { success: true };
		}),

	reorderLinks: workspaceProcedure
		.input(reorderBioLinksSchema)
		.mutation(async ({ input, ctx }) => {
			const { blockId, beforeLinkId, afterLinkId, links } = input;

			// Verify block belongs to workspace
			const block = await dbHttp.query.BioBlocks.findFirst({
				where: and(
					eq(BioBlocks.id, blockId),
					eq(BioBlocks.workspaceId, ctx.workspace.id),
				),
			});

			if (!block) raiseTRPCError({ message: 'Block not found' });

			// Validate the lexoRank calculation server-side
			// Get the before and after links if they exist
			let beforeLexoRank: string | null = null;
			let afterLexoRank: string | null = null;

			if (beforeLinkId) {
				const beforeLink = await dbHttp.query._BioLinks_To_BioBlocks.findFirst({
					where: and(
						eq(_BioLinks_To_BioBlocks.bioBlockId, blockId),
						eq(_BioLinks_To_BioBlocks.bioLinkId, beforeLinkId),
					),
				});
				beforeLexoRank = beforeLink?.lexoRank ?? null;
			}

			if (afterLinkId) {
				const afterLink = await dbHttp.query._BioLinks_To_BioBlocks.findFirst({
					where: and(
						eq(_BioLinks_To_BioBlocks.bioBlockId, blockId),
						eq(_BioLinks_To_BioBlocks.bioLinkId, afterLinkId),
					),
				});
				afterLexoRank = afterLink?.lexoRank ?? null;
			}

			// Validate and potentially recalculate lexoRank for each moved link
			// This must be done sequentially since each link's rank depends on the previous one
			const validatedLinks: { id: string; lexoRank: string }[] = [];

			for (let i = 0; i < links.length; i++) {
				const link = links[i] ?? raiseTRPCError({ message: 'Link not found' });
				const prevRank =
					i === 0 ? beforeLexoRank : (
						(validatedLinks[i - 1]?.lexoRank ??
						raiseTRPCError({ message: 'Previous link not found' }))
					);
				const nextRank =
					i === links.length - 1 ?
						afterLexoRank
					:	(validatedLinks[i + 1]?.lexoRank ??
						raiseTRPCError({ message: 'Next link not found' }));
				const lexoRank = generateLexoRank({ prev: prevRank, next: nextRank });

				validatedLinks.push({
					id: link.id,
					lexoRank,
				});
			}

			// Update only the moved links with their new ranks
			const updates = validatedLinks.map(link => {
				return dbPool(ctx.pool)
					.update(_BioLinks_To_BioBlocks)
					.set({ lexoRank: link.lexoRank })
					.where(
						and(
							eq(_BioLinks_To_BioBlocks.bioBlockId, blockId),
							eq(_BioLinks_To_BioBlocks.bioLinkId, link.id),
						),
					);
			});

			await Promise.all(updates);

			return { success: true };
		}),

	updateLinkImage: workspaceProcedure
		.input(
			z.object({
				linkId: z.string(),
				fileId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Verify the link belongs to the workspace
			const link = await dbPool(ctx.pool).query.BioLinks.findFirst({
				where: and(
					eq(BioLinks.id, input.linkId),
					eq(BioLinks.workspaceId, ctx.workspace.id),
				),
			});

			if (!link) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Link not found',
				});
			}

			// Verify the file belongs to the workspace
			const file = await dbPool(ctx.pool).query.Files.findFirst({
				where: and(eq(Files.id, input.fileId), eq(Files.workspaceId, ctx.workspace.id)),
			});

			if (!file) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'File not found',
				});
			}

			// Check if file needs blur hash generation
			if (!file.blurDataUrl && file.s3Key) {
				// Import dynamically to avoid circular dependencies
				waitUntil(
					tasks.trigger<typeof generateFileBlurHash>('generate-file-blur-hash', {
						fileId: file.id,
						s3Key: file.s3Key,
					}),
				);
			}

			// Delete any existing image relation for this link
			await dbPool(ctx.pool)
				.delete(_Files_To_BioLinks__Images)
				.where(eq(_Files_To_BioLinks__Images.bioLinkId, input.linkId));

			// Create new image relation
			await dbPool(ctx.pool).insert(_Files_To_BioLinks__Images).values({
				fileId: input.fileId,
				bioLinkId: input.linkId,
			});

			return { success: true };
		}),

	removeLinkImage: workspaceProcedure
		.input(
			z.object({
				linkId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Verify the link belongs to the workspace
			const link = await dbPool(ctx.pool).query.BioLinks.findFirst({
				where: and(
					eq(BioLinks.id, input.linkId),
					eq(BioLinks.workspaceId, ctx.workspace.id),
				),
			});

			if (!link) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Link not found',
				});
			}

			// Delete the image relation
			await dbPool(ctx.pool)
				.delete(_Files_To_BioLinks__Images)
				.where(eq(_Files_To_BioLinks__Images.bioLinkId, input.linkId));

			return { success: true };
		}),

	// New route to update bio key
	updateKey: workspaceProcedure
		.input(
			z.object({
				id: z.string(),
				key: z
					.string()
					.min(1)
					.max(50)
					.regex(/^[a-z0-9-]+$/, {
						message: 'Key must be lowercase alphanumeric with hyphens only',
					}),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { id, key } = input;

			// Check if bio exists
			const existingBio = await dbHttp.query.Bios.findFirst({
				where: and(eq(Bios.id, id), eq(Bios.workspaceId, ctx.workspace.id)),
			});

			if (!existingBio) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Bio not found',
				});
			}

			// Prevent changing the home bio key
			if (existingBio.key === 'home') {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Cannot change the key of the home bio',
				});
			}

			// Check if new key already exists for this workspace
			const keyExists = await dbHttp.query.Bios.findFirst({
				where: and(
					eq(Bios.workspaceId, ctx.workspace.id),
					eq(Bios.key, key),
					isNull(Bios.deletedAt),
				),
			});

			if (keyExists && keyExists.id !== id) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'A bio with this key already exists',
				});
			}

			// Update the key
			const [updatedBio] = await dbPool(ctx.pool)
				.update(Bios)
				.set({ key })
				.where(and(eq(Bios.id, id), eq(Bios.workspaceId, ctx.workspace.id)))
				.returning();

			return updatedBio ?? raiseTRPCError({ message: 'Failed to update bio key' });
		}),

	// Create a new bio with a custom key
	createBio: workspaceProcedure
		.input(
			z.object({
				key: z
					.string()
					.min(1)
					.max(50)
					.regex(/^[a-z0-9-]+$/, {
						message: 'Key must be lowercase alphanumeric with hyphens only',
					}),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { key } = input;

			// Check if key already exists
			const keyExists = await dbHttp.query.Bios.findFirst({
				where: and(
					eq(Bios.workspaceId, ctx.workspace.id),
					eq(Bios.key, key),
					isNull(Bios.deletedAt),
				),
			});

			if (keyExists) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'A bio with this key already exists',
				});
			}

			const bioId = newId('bio');
			const blockId = newId('bioBlock');

			// Create bio with transaction-like error handling
			try {
				await dbPool(ctx.pool).insert(Bios).values({
					id: bioId,
					workspaceId: ctx.workspace.id,
					handle: ctx.workspace.handle,
					key,
					socialDisplay: false,
					barelyBranding: true,
					emailCaptureEnabled: false,
				});

				// Create default links block
				await dbPool(ctx.pool).insert(BioBlocks).values({
					id: blockId,
					workspaceId: ctx.workspace.id,
					type: 'links',
					enabled: true,
				});

				// Connect block to bio
				const firstLexoRank = generateLexoRank({ prev: null, next: null });
				await dbPool(ctx.pool).insert(_BioBlocks_To_Bios).values({
					bioId,
					bioBlockId: blockId,
					lexoRank: firstLexoRank,
				});
			} catch (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to create bio with default block',
					cause: error,
				});
			}

			const bio = await getBioByHandleAndKey({
				handle: ctx.workspace.handle,
				key,
			});

			if (!bio) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to retrieve bio after creation',
				});
			}

			return bio;
		}),

	// Archive bio (soft delete)
	archiveBio: workspaceProcedure
		.input(z.object({ ids: z.array(z.string()) }))
		.mutation(async ({ input, ctx }) => {
			// Check if any of the bios are the home bio
			const bios = await dbHttp.query.Bios.findMany({
				where: and(eq(Bios.workspaceId, ctx.workspace.id), inArray(Bios.id, input.ids)),
			});

			const homeBio = bios.find(bio => bio.key === 'home');
			if (homeBio) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Cannot archive the home bio',
				});
			}

			const archivedBios = await dbPool(ctx.pool)
				.update(Bios)
				.set({ archivedAt: new Date() })
				.where(and(eq(Bios.workspaceId, ctx.workspace.id), inArray(Bios.id, input.ids)))
				.returning();

			return archivedBios[0] ?? raiseTRPCError({ message: 'Failed to archive bio' });
		}),

	// Delete bio (hard delete)
	deleteBio: workspaceProcedure
		.input(z.object({ ids: z.array(z.string()) }))
		.mutation(async ({ input, ctx }) => {
			// Check if any of the bios are the home bio
			const bios = await dbHttp.query.Bios.findMany({
				where: and(eq(Bios.workspaceId, ctx.workspace.id), inArray(Bios.id, input.ids)),
			});

			const homeBio = bios.find(bio => bio.key === 'home');
			if (homeBio) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Cannot delete the home bio',
				});
			}

			const deletedBios = await dbPool(ctx.pool)
				.update(Bios)
				.set({ deletedAt: new Date() })
				.where(and(eq(Bios.workspaceId, ctx.workspace.id), inArray(Bios.id, input.ids)))
				.returning();

			return deletedBios[0] ?? raiseTRPCError({ message: 'Failed to delete bio' });
		}),
} satisfies TRPCRouterRecord;

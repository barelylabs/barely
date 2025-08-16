import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { dbPool } from '@barely/db/pool';
import {
	_BioBlocks_To_Bios,
	_BioButtons_To_Bios,
	_BioLinks_To_BioBlocks,
	BioBlocks,
	BioButtons,
	BioLinks,
	Bios,
	Links,
	Tracks,
	Workspaces,
} from '@barely/db/sql';
import { sqlAnd, sqlStringContains } from '@barely/db/utils';
import { newId, raiseTRPCError } from '@barely/utils';
import {
	createBioBlockSchema,
	createBioButtonSchema,
	createBioLinkSchema,
	createBioSchema,
	reorderBioBlocksSchema,
	reorderBioButtonsSchema,
	reorderBioLinksSchema,
	selectInfiniteBiosSchema,
	updateBioBlockSchema,
	updateBioButtonSchema,
	updateBioLinkSchema,
	updateBioSchema,
} from '@barely/validators';
import { TRPCError } from '@trpc/server';
import { and, asc, desc, eq, gt, isNull, lt, or } from 'drizzle-orm';
import { z } from 'zod/v4';

import { generateBioButtonSuggestions } from '../../functions/bio-suggestions.fns';
import { getBioByHandleAndKey } from '../../functions/bio.fns';
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
			// Find existing bio or create one if it doesn't exist
			let bio = await getBioByHandleAndKey({
				handle: ctx.workspace.handle,
				key: input.key,
			});

			// If no bio exists, create one with defaults and a default links block
			if (!bio) {
				const bioId = newId('bio');
				const blockId = newId('bio');

				// Create bio with transaction-like error handling
				try {
					await dbPool(ctx.pool).insert(Bios).values({
						id: bioId,
						workspaceId: ctx.workspace.id,
						handle: ctx.workspace.handle,
						key: input.key,
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

	reorderButtons: workspaceProcedure
		.input(reorderBioButtonsSchema)
		.mutation(async ({ input, ctx }) => {
			const { bioId, buttonIds } = input;

			// Verify bio belongs to workspace
			const bio = await dbHttp.query.Bios.findFirst({
				where: and(eq(Bios.id, bioId), eq(Bios.workspaceId, ctx.workspace.id)),
			});

			if (!bio) raiseTRPCError({ message: 'Bio not found' });

			// Get current buttons with their lexoRanks to maintain valid ordering
			const currentButtons = await dbHttp.query._BioButtons_To_Bios.findMany({
				where: eq(_BioButtons_To_Bios.bioId, bioId),
				orderBy: [asc(_BioButtons_To_Bios.lexoRank)],
			});

			// Create a map of current lexoRanks for reference
			const currentRankMap = new Map(
				currentButtons.map(b => [b.bioButtonId, b.lexoRank]),
			);

			// Generate new lexoRanks for the ordered buttons
			const newRanks: string[] = [];
			for (let i = 0; i < buttonIds.length; i++) {
				let lexoRank: string;

				if (i === 0) {
					// First item
					const nextButtonId = buttonIds[i + 1];
					const nextRank =
						nextButtonId ? (currentRankMap.get(nextButtonId) ?? null) : null;
					lexoRank = generateLexoRank({ prev: null, next: nextRank });
				} else if (i === buttonIds.length - 1) {
					// Last item
					const prevRank = newRanks[i - 1] ?? null;
					lexoRank = generateLexoRank({ prev: prevRank, next: null });
				} else {
					// Middle item - between previous new rank and next current rank
					const nextButtonId = buttonIds[i + 1];
					const nextRank =
						nextButtonId ? (currentRankMap.get(nextButtonId) ?? null) : null;
					const prevRank = newRanks[i - 1] ?? null;
					lexoRank = generateLexoRank({
						prev: prevRank,
						next: nextRank,
					});
				}

				newRanks.push(lexoRank);
			}

			// Update all buttons with their new ranks
			const updates = buttonIds.map((buttonId, index) => {
				return dbPool(ctx.pool)
					.update(_BioButtons_To_Bios)
					.set({ lexoRank: newRanks[index] })
					.where(
						and(
							eq(_BioButtons_To_Bios.bioId, bioId),
							eq(_BioButtons_To_Bios.bioButtonId, buttonId),
						),
					);
			});

			await Promise.all(updates);

			return { success: true };
		}),

	// Get button suggestions based on workspace data
	getButtonSuggestions: workspaceProcedure
		.input(z.object({ bioId: z.string().optional() }))
		.query(async ({ ctx }) => {
			// Fetch workspace data for suggestions
			const [links, tracks, workspace] = await Promise.all([
				dbHttp.query.Links.findMany({
					where: eq(Links.workspaceId, ctx.workspace.id),
					orderBy: [desc(Links.clicks)],
					limit: 10,
				}),
				dbHttp.query.Tracks.findMany({
					where: eq(Tracks.workspaceId, ctx.workspace.id),
					orderBy: [desc(Tracks.createdAt)],
					limit: 5,
				}),
				dbHttp.query.Workspaces.findFirst({
					where: eq(Workspaces.id, ctx.workspace.id),
					columns: {
						spotifyArtistId: true,
						instagramUsername: true,
						tiktokUsername: true,
						youtubeChannelId: true,
					},
				}),
			]);

			const suggestions = generateBioButtonSuggestions({
				links,
				tracks,
				spotifyArtistId: workspace?.spotifyArtistId,
				instagramUsername: workspace?.instagramUsername,
				tiktokUsername: workspace?.tiktokUsername,
				youtubeChannelId: workspace?.youtubeChannelId,
			});

			return suggestions;
		}),

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
			createBioBlockSchema.extend({
				bioId: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { bioId, ...blockData } = input;

			// Verify bio belongs to workspace
			const bio = await dbHttp.query.Bios.findFirst({
				where: and(eq(Bios.id, bioId), eq(Bios.workspaceId, ctx.workspace.id)),
			});

			if (!bio) raiseTRPCError({ message: 'Bio not found' });

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
				bioBlockId: blockId,
				lexoRank,
			});

			return block;
		}),

	updateBlock: workspaceProcedure
		.input(updateBioBlockSchema)
		.mutation(async ({ input, ctx }) => {
			const { id, ...data } = input;

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
			const { blockId, linkIds } = input;

			// Verify block belongs to workspace
			const block = await dbHttp.query.BioBlocks.findFirst({
				where: and(
					eq(BioBlocks.id, blockId),
					eq(BioBlocks.workspaceId, ctx.workspace.id),
				),
			});

			if (!block) raiseTRPCError({ message: 'Block not found' });

			// Get current links with their lexoRanks to maintain valid ordering
			const currentLinks = await dbHttp.query._BioLinks_To_BioBlocks.findMany({
				where: eq(_BioLinks_To_BioBlocks.bioBlockId, blockId),
				orderBy: [asc(_BioLinks_To_BioBlocks.lexoRank)],
			});

			// Create a map of current lexoRanks for reference
			const currentRankMap = new Map(currentLinks.map(l => [l.bioLinkId, l.lexoRank]));

			// Generate new lexoRanks for the ordered links
			const newRanks: string[] = [];
			for (let i = 0; i < linkIds.length; i++) {
				let lexoRank: string;

				if (i === 0) {
					// First item
					const nextLinkId = linkIds[i + 1];
					const nextRank = nextLinkId ? (currentRankMap.get(nextLinkId) ?? null) : null;
					lexoRank = generateLexoRank({ prev: null, next: nextRank });
				} else if (i === linkIds.length - 1) {
					// Last item
					const prevRank = newRanks[i - 1] ?? null;
					lexoRank = generateLexoRank({ prev: prevRank, next: null });
				} else {
					// Middle item - between previous new rank and next current rank
					const nextLinkId = linkIds[i + 1];
					const nextRank = nextLinkId ? (currentRankMap.get(nextLinkId) ?? null) : null;
					const prevRank = newRanks[i - 1] ?? null;
					lexoRank = generateLexoRank({
						prev: prevRank,
						next: nextRank,
					});
				}

				newRanks.push(lexoRank);
			}

			// Update all links with their new ranks
			const updates = linkIds.map((linkId, index) => {
				return dbPool(ctx.pool)
					.update(_BioLinks_To_BioBlocks)
					.set({ lexoRank: newRanks[index] })
					.where(
						and(
							eq(_BioLinks_To_BioBlocks.bioBlockId, blockId),
							eq(_BioLinks_To_BioBlocks.bioLinkId, linkId),
						),
					);
			});

			await Promise.all(updates);

			return { success: true };
		}),
} satisfies TRPCRouterRecord;

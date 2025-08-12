import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { dbPool } from '@barely/db/pool';
import {
	_BioButtons_To_Bios,
	BioButtons,
	Bios,
	Links,
	Tracks,
	Workspaces,
} from '@barely/db/sql';
import { sqlAnd, sqlStringContains } from '@barely/db/utils';
import { newId, raise } from '@barely/utils';
import {
	createBioButtonSchema,
	createBioSchema,
	reorderBioButtonsSchema,
	selectInfiniteBiosSchema,
	updateBioButtonSchema,
	updateBioSchema,
} from '@barely/validators';
import { TRPCError } from '@trpc/server';
import { and, asc, desc, eq, gt, isNull, lt, or } from 'drizzle-orm';
import { z } from 'zod/v4';

import { generateBioButtonSuggestions } from '../../functions/bio-suggestions.fns';
import { generateLexoRank } from '../../functions/lexo-rank.fns';
import { detectLinkType, formatLinkUrl } from '../../functions/link-type.fns';
import { workspaceProcedure } from '../trpc';

export const bioRoute = {
	byHandle: workspaceProcedure
		.input(z.object({ handle: z.string() }))
		.query(async ({ ctx }) => {
			// Find existing bio or create one if it doesn't exist
			let bio = await dbHttp.query.Bios.findFirst({
				where: and(eq(Bios.workspaceId, ctx.workspace.id), isNull(Bios.deletedAt)),
				with: {
					workspace: {
						columns: {
							id: true,
							name: true,
							handle: true,
							imageUrl: true,
						},
					},
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

			// If no bio exists, create one with defaults
			if (!bio) {
				const bioId = newId('bio');

				await dbPool(ctx.pool).insert(Bios).values({
					id: bioId,
					workspaceId: ctx.workspace.id,
					handle: ctx.workspace.handle,
					title: ctx.workspace.name,
					subtitle: '',
					theme: 'light',
					socialDisplay: false,
					barelyBranding: true,
					emailCaptureEnabled: false,
				});

				bio = await dbHttp.query.Bios.findFirst({
					where: eq(Bios.id, bioId),
					with: {
						workspace: {
							columns: {
								id: true,
								name: true,
								handle: true,
								imageUrl: true,
							},
						},
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

				if (!bio) {
					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: 'Failed to create bio',
					});
				}
			}

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
									domain: bb.bioButton.link.domain ?? '',
								}
							:	undefined,
					}))
					.sort((a, b) => a.lexoRank.localeCompare(b.lexoRank)),
			};
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
					!!search && sqlStringContains(Bios.title, search),
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
									domain: bb.bioButton.link.domain ?? '',
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
									domain: bb.bioButton.link.domain ?? '',
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

		return bio ?? raise('Failed to create bio');
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

			return updatedBio ?? raise('Failed to update bio');
		}),

	archive: workspaceProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const [archivedBio] = await dbPool(ctx.pool)
				.update(Bios)
				.set({ archivedAt: new Date() })
				.where(and(eq(Bios.id, input.id), eq(Bios.workspaceId, ctx.workspace.id)))
				.returning();

			return archivedBio ?? raise('Failed to archive bio');
		}),

	unarchive: workspaceProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const [unarchivedBio] = await dbPool(ctx.pool)
				.update(Bios)
				.set({ archivedAt: null })
				.where(and(eq(Bios.id, input.id), eq(Bios.workspaceId, ctx.workspace.id)))
				.returning();

			return unarchivedBio ?? raise('Failed to unarchive bio');
		}),

	delete: workspaceProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const [deletedBio] = await dbPool(ctx.pool)
				.update(Bios)
				.set({ deletedAt: new Date() })
				.where(and(eq(Bios.id, input.id), eq(Bios.workspaceId, ctx.workspace.id)))
				.returning();

			return deletedBio ?? raise('Failed to delete bio');
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

			if (!bio) raise('Bio not found');

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

			if (!button) raise('Failed to create button');

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

			return updatedButton ?? raise('Failed to update button');
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

			if (!bio) raise('Bio not found');

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

			if (!bio) raise('Bio not found');

			// Generate new lexoRanks for the ordered buttons
			const updates = buttonIds.map((buttonId, index) => {
				const prev = index > 0 ? `a${index}` : null;
				const next = index < buttonIds.length - 1 ? `a${index + 2}` : null;
				const lexoRank = generateLexoRank({ prev, next });

				return dbPool(ctx.pool)
					.update(_BioButtons_To_Bios)
					.set({ lexoRank })
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
} satisfies TRPCRouterRecord;

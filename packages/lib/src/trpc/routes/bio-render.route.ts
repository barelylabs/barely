import type { TRPCRouterRecord } from '@trpc/server';
import { WEB_EVENT_TYPES__BIO } from '@barely/const';
import { dbHttp } from '@barely/db/client';
import { dbPool, makePool } from '@barely/db/pool';
import { _Fans_To_Workspaces, Fans } from '@barely/db/sql';
import {
	_BioBlocks_To_Bios,
	_BioButtons_To_Bios,
	_BioLinks_To_BioBlocks,
	BioLinks,
	Bios,
} from '@barely/db/sql/bio.sql';
import { publicProcedure } from '@barely/lib/trpc';
import { newId, raiseTRPCError } from '@barely/utils';
import { TRPCError } from '@trpc/server';
import { and, eq, isNull } from 'drizzle-orm';
import { z } from 'zod/v4';

import { recordBioEvent } from '../../functions/bio-event.fns';
import {
	getBioBlocksByHandleAndKey,
	getBioByHandleAndKey,
} from '../../functions/bio.fns';
import { getBrandKit } from '../../functions/brand-kit.fns';
import { ratelimit } from '../../integrations/upstash';

export const bioRenderRoute = {
	byHandleAndKey: publicProcedure
		.input(z.object({ handle: z.string(), key: z.string().optional().default('home') }))
		.query(async ({ input }) => {
			const bio = await getBioByHandleAndKey(input);

			if (!bio) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Bio not found',
				});
			}

			return bio;
		}),

	brandKitByHandle: publicProcedure
		.input(z.object({ handle: z.string() }))
		.query(async ({ input }) => {
			const brandKit = await getBrandKit({
				handle: input.handle,
			});

			if (!brandKit) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Brand kit not found',
				});
			}

			return brandKit;
		}),

	blocksByHandleAndKey: publicProcedure
		.input(z.object({ handle: z.string(), key: z.string() }))
		.query(async ({ input }) => {
			const blocks = await getBioBlocksByHandleAndKey({
				handle: input.handle,
				key: input.key,
			});

			// this is a public route, so if blocks is empty, we don't throw an error. we just return an empty array.

			return blocks;
		}),

	log: publicProcedure
		.input(
			z.object({
				bioId: z.string(),
				type: z.enum(WEB_EVENT_TYPES__BIO),
				linkId: z.string().optional(),
				blockId: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { visitor } = ctx;
			const { bioId, linkId } = input;

			const bio =
				(await dbHttp.query.Bios.findFirst({
					where: eq(Bios.id, bioId),
					with: {
						workspace: {
							columns: {
								id: true,
								plan: true,
								eventUsage: true,
								eventUsageLimitOverride: true,
							},
						},
					},
				})) ?? raiseTRPCError({ message: 'Bio not found' });

			let bioLink = undefined;
			if (linkId) {
				bioLink = await dbHttp.query.BioLinks.findFirst({
					where: and(eq(BioLinks.id, linkId), eq(BioLinks.workspaceId, bio.workspaceId)),
					with: {
						link: true,
					},
				});
			}

			await recordBioEvent({
				bio,
				bioLink,
				type: input.type,
				visitor,
				workspace: bio.workspace,
			});

			return { success: true };
		}),

	captureEmail: publicProcedure
		.input(
			z.object({
				bioId: z.string(),
				email: z.email(),
				marketingConsent: z.boolean().default(false),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { visitor } = ctx;
			const { bioId, email, marketingConsent } = input;

			// Rate limit email capture attempts by IP (3 attempts per hour)
			const { success } = await ratelimit(3, '1 h').limit(
				`bio.email.capture.${visitor?.ip ?? '127.0.0.1'}`,
			);

			if (!success) {
				throw new TRPCError({
					code: 'TOO_MANY_REQUESTS',
					message: 'Too many email capture attempts. Please try again later.',
				});
			}

			const bio =
				(await dbHttp.query.Bios.findFirst({
					where: eq(Bios.id, bioId),
					with: {
						workspace: {
							columns: {
								id: true,
								name: true,
								plan: true,
								eventUsage: true,
								eventUsageLimitOverride: true,
							},
						},
					},
				})) ?? raiseTRPCError({ message: 'Bio not found' });

			// Check if email capture is enabled for this bio
			if (!bio.emailCaptureEnabled) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'Email capture is not enabled for this bio page.',
				});
			}

			// Use database transaction for fan creation and email capture
			const pool = makePool();
			await dbPool(pool).transaction(async tx => {
				// Check if fan already exists globally
				const existingFan = await tx.query.Fans.findFirst({
					where: and(eq(Fans.email, email), isNull(Fans.deletedAt)),
				});

				let fanId: string;

				if (!existingFan) {
					// Create new fan - clean up email prefix for fullName
					const emailPrefix = email.split('@')[0] ?? 'Fan';
					const cleanedName =
						emailPrefix
							.replace(/\+/g, ' ') // Replace + with space
							.replace(/[._-]/g, ' ') // Replace other separators with space
							.replace(/\d+/g, '') // Remove numbers
							.trim() || 'Fan'; // Fallback to 'Fan' if empty

					const newFans = await tx
						.insert(Fans)
						.values({
							id: newId('fan'),
							workspaceId: bio.workspaceId,
							email,
							fullName: cleanedName,
							emailMarketingOptIn: marketingConsent,
							appReferer: 'bio', // Track that this fan came from bio page
							createdAt: new Date(),
							updatedAt: new Date(),
						})
						.onConflictDoUpdate({
							target: [Fans.email],
							set: {
								updatedAt: new Date(),
								emailMarketingOptIn: marketingConsent,
							},
						})
						.returning();

					if (!newFans[0]) {
						throw new TRPCError({
							code: 'INTERNAL_SERVER_ERROR',
							message: 'Failed to create fan record',
						});
					}

					fanId = newFans[0].id;
				} else {
					// Update existing fan's marketing consent
					await tx
						.update(Fans)
						.set({
							updatedAt: new Date(),
							emailMarketingOptIn: marketingConsent,
							...(existingFan.appReferer ? {} : { appReferer: 'bio' as const }),
						})
						.where(eq(Fans.id, existingFan.id));

					fanId = existingFan.id;
				}

				// Check if fan is already linked to this workspace
				const existingLink = await tx.query._Fans_To_Workspaces.findFirst({
					where: and(
						eq(_Fans_To_Workspaces.fanId, fanId),
						eq(_Fans_To_Workspaces.workspaceId, bio.workspaceId),
					),
				});

				// Link fan to workspace if not already linked
				if (!existingLink) {
					try {
						await tx.insert(_Fans_To_Workspaces).values({
							fanId,
							workspaceId: bio.workspaceId,
						});
					} catch (error) {
						// Ignore if already exists (race condition)
						// Fan-workspace link might already exist due to race condition
					}
				}

				return { fanId };
			});

			// Record the email capture event
			await recordBioEvent({
				bio,
				type: 'bio/emailCapture',
				visitor,
				workspace: bio.workspace,
			});

			// TODO: Trigger welcome email automation
			// This should integrate with the email automation system once available
			// For now, fans are created and can be managed through the admin panel

			return {
				success: true,
				message:
					marketingConsent ?
						"Thank you! You've been added to our mailing list."
					:	'Thank you! Your email has been captured.',
			};
		}),
} satisfies TRPCRouterRecord;

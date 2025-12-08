import type { TRPCRouterRecord } from '@trpc/server';
import { BIO_BLOCK_TYPES, WEB_EVENT_TYPES__BIO } from '@barely/const';
import { dbHttp } from '@barely/db/client';
import { dbPool, makePool } from '@barely/db/pool';
import { _Fans_To_Workspaces, Fans } from '@barely/db/sql';
import {
	_BioBlocks_To_Bios,
	_BioButtons_To_Bios,
	_BioLinks_To_BioBlocks,
	BioBlocks,
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
import { log } from '../../utils/log';

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
				blockType: z.enum(BIO_BLOCK_TYPES).optional(),
				blockIndex: z.number().optional(),
				linkIndex: z.number().optional(),
				linkAnimation: z
					.enum(['none', 'bounce', 'wobble', 'jello', 'pulse', 'shake', 'tada'])
					.optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { visitor } = ctx;
			const { bioId, linkId, blockId, blockType, blockIndex, linkIndex, linkAnimation } =
				input;

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
				blockId,
				blockType,
				blockIndex,
				linkIndex,
				linkAnimation,
			});

			return { success: true };
		}),

	captureEmail: publicProcedure
		.input(
			z.object({
				bioId: z.string(),
				blockId: z.string().optional(), // Optional for backwards compatibility with legacy forms
				email: z.email(), // Email is always required (Fan.email is notNull)
				phone: z.string().optional(),
				marketingConsent: z.boolean().default(false),
				smsMarketingConsent: z.boolean().default(false),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { visitor } = ctx;
			const { bioId, blockId, email, phone, marketingConsent, smsMarketingConsent } =
				input;

			// Rate limit capture attempts by IP (3 attempts per hour)
			const { success } = await ratelimit(3, '1 h').limit(
				`bio.contact.capture.${visitor?.ip ?? '127.0.0.1'}`,
			);

			if (!success) {
				throw new TRPCError({
					code: 'TOO_MANY_REQUESTS',
					message: 'Too many capture attempts. Please try again later.',
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

			// Check if SMS capture is enabled for phone number collection
			// Email is always captured (Fan.email is notNull)
			let smsCaptureAllowed = false;

			if (blockId) {
				// Block-level validation (new contact form blocks)
				const block = await dbHttp.query.BioBlocks.findFirst({
					where: and(
						eq(BioBlocks.id, blockId),
						eq(BioBlocks.workspaceId, bio.workspaceId),
					),
				});

				if (!block || block.type !== 'contactForm') {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Contact form block not found.',
					});
				}

				smsCaptureAllowed = !!(phone && (block.smsCaptureEnabled ?? true));
			}
			// Legacy bio-level forms don't support SMS, but email is always allowed

			// Use database transaction for fan creation and contact capture
			const pool = makePool();
			await dbPool(pool).transaction(async tx => {
				// Check if fan already exists globally by email
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
							phoneNumber: smsCaptureAllowed ? phone : undefined,
							emailMarketingOptIn: marketingConsent,
							smsMarketingOptIn: smsCaptureAllowed && phone ? smsMarketingConsent : false,
							appReferer: 'bio', // Track that this fan came from bio page
							createdAt: new Date(),
							updatedAt: new Date(),
						})
						.onConflictDoUpdate({
							target: [Fans.email],
							set: {
								updatedAt: new Date(),
								emailMarketingOptIn: marketingConsent,
								...(smsCaptureAllowed && phone ?
									{ phoneNumber: phone, smsMarketingOptIn: smsMarketingConsent }
								:	{}),
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
					// Update existing fan's marketing consent and phone
					await tx
						.update(Fans)
						.set({
							updatedAt: new Date(),
							emailMarketingOptIn: marketingConsent,
							...(smsCaptureAllowed && phone ?
								{ phoneNumber: phone, smsMarketingOptIn: smsMarketingConsent }
							:	{}),
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
					} catch {
						// Ignore if already exists (race condition)
						// Fan-workspace link might already exist due to race condition
						await log({
							message: 'Fan-workspace link might already exist',
							location: 'bio-render.captureEmail',
							type: 'logs',
						});
					}
				}

				return { fanId };
			});

			// Record the capture event
			await recordBioEvent({
				bio,
				type: 'bio/emailCapture',
				visitor,
				workspace: bio.workspace,
				emailMarketingOptIn: email ? marketingConsent : undefined,
				smsMarketingOptIn: phone ? smsMarketingConsent : undefined,
			});

			// Build success message based on what was captured
			let message: string;
			if (email && phone) {
				message =
					marketingConsent || smsMarketingConsent ?
						"Thank you! You've been added to our contact list."
					:	'Thank you! Your contact info has been captured.';
			} else if (email) {
				message =
					marketingConsent ?
						"Thank you! You've been added to our mailing list."
					:	'Thank you! Your email has been captured.';
			} else {
				message =
					smsMarketingConsent ?
						"Thank you! You've been added to our SMS list."
					:	'Thank you! Your phone number has been captured.';
			}

			return {
				success: true,
				message,
			};
		}),
} satisfies TRPCRouterRecord;

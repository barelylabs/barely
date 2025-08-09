import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { _Fans_To_Workspaces, Fans, Workspaces } from '@barely/db/sql';
import { VipSwapAccessLogs, VipSwaps } from '@barely/db/sql/vip-swap.sql';
import { sendEmail } from '@barely/email';
import { VipDownloadEmailTemplate } from '@barely/email/templates';
import { publicProcedure } from '@barely/lib/trpc';
import { getAbsoluteUrl, newId } from '@barely/utils';
import {
	vipSwapDownloadRequestSchema,
	vipSwapDownloadTokenSchema,
} from '@barely/validators';
import { TRPCError } from '@trpc/server';
import { and, eq, isNull } from 'drizzle-orm';
import { z } from 'zod/v4';

import { recordVipEvent } from '../../functions/event.fns';
import { ratelimit } from '../../integrations/upstash';
import { generateUniqueDownloadToken } from '../../utils/token';

export const vipSwapRenderRoute = {
	byHandleAndKey: publicProcedure
		.input(z.object({ handle: z.string(), key: z.string() }))
		.query(async ({ input }) => {
			const { handle, key } = input;

			const vipSwap = await dbHttp.query.VipSwaps.findFirst({
				where: and(
					eq(VipSwaps.handle, handle),
					eq(VipSwaps.key, key),
					eq(VipSwaps.isActive, true),
					isNull(VipSwaps.deletedAt),
				),
				with: {
					coverImage: true,
					file: true,
					workspace: true,
				},
			});

			if (!vipSwap) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'VIP swap not found',
				});
			}

			// Generate blur hash if missing
			if (vipSwap.coverImage && !vipSwap.coverImage.blurDataUrl) {
				const { getBlurHash } = await import('../../functions/file.blurhash');
				const { blurHash, blurDataUrl } = await getBlurHash(vipSwap.coverImage.s3Key);

				if (blurHash && blurDataUrl) {
					vipSwap.coverImage.blurHash = blurHash;
					vipSwap.coverImage.blurDataUrl = blurDataUrl;

					// Update the database with the blur hash
					const { Files } = await import('@barely/db/sql/file.sql');
					await dbHttp
						.update(Files)
						.set({ blurHash, blurDataUrl })
						.where(eq(Files.id, vipSwap.coverImage.id));
				}
			}

			return vipSwap;
		}),

	// Submit email for download
	requestDownload: publicProcedure
		.input(vipSwapDownloadRequestSchema)
		.mutation(async ({ ctx, input }) => {
			const { handle, key, email, ...utmParams } = input;

			const { success } = await ratelimit(5, '5 m').limit(
				`vip.swap.${handle}.${key}.${ctx.visitor?.ip ?? '127.0.0.1'}`,
			);

			if (!success) {
				throw new TRPCError({
					code: 'TOO_MANY_REQUESTS',
					message: 'Too many requests',
				});
			}

			// Get the VIP swap
			const vipSwap = await dbHttp.query.VipSwaps.findFirst({
				where: and(
					eq(VipSwaps.handle, handle),
					eq(VipSwaps.key, key),
					eq(VipSwaps.isActive, true),
					isNull(VipSwaps.deletedAt),
				),
				with: {
					workspace: true,
				},
			});

			if (!vipSwap?.workspace) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'This content is no longer available, or the link is invalid.',
				});
			}

			// Check if expired
			if (vipSwap.expiresAt && vipSwap.expiresAt < new Date()) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'This swap has expired',
				});
			}

			// Check if email already has max downloads
			if (vipSwap.downloadLimit) {
				const existingDownloads = await dbHttp.query.VipSwapAccessLogs.findMany({
					where: and(
						eq(VipSwapAccessLogs.vipSwapId, vipSwap.id),
						eq(VipSwapAccessLogs.email, email),
						eq(VipSwapAccessLogs.accessType, 'download'),
					),
				});

				if (existingDownloads.length >= vipSwap.downloadLimit) {
					throw new TRPCError({
						code: 'FORBIDDEN',
						message: 'Maximum downloads reached for this email',
					});
				}
			}

			// Generate unique download token
			const downloadToken = await generateUniqueDownloadToken(dbHttp);
			const expiryMinutes = vipSwap.downloadLinkExpiryMinutes ?? 1440; // 24 hours = 1440 minutes
			const downloadTokenExpiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

			// Get sessionId from visitor context
			const sessionId = ctx.visitor?.sessionId ?? newId('vipSession');

			// Add or update fan in workspace
			// First, check if a fan with this email exists globally
			const existingFan = await dbHttp.query.Fans.findFirst({
				where: and(eq(Fans.email, email), isNull(Fans.deletedAt)),
			});

			let fanId: string;

			if (!existingFan) {
				// Create new fan globally
				// Clean up email prefix for fullName (handle + and other special chars)
				const emailPrefix = email.split('@')[0] ?? 'Fan';
				const cleanedName =
					emailPrefix
						.replace(/\+/g, ' ') // Replace + with space
						.replace(/[._-]/g, ' ') // Replace other separators with space
						.replace(/\d+/g, '') // Remove numbers
						.trim() || 'Fan'; // Fallback to 'Fan' if empty

				const newFans = await dbHttp
					.insert(Fans)
					.values({
						id: newId('fan'),
						workspaceId: vipSwap.workspaceId, // Set initial workspace
						email,
						fullName: cleanedName,
						emailMarketingOptIn: true, // They opted in by requesting content
						appReferer: 'vip', // Track that this fan came from VIP swap
						createdAt: new Date(),
						updatedAt: new Date(),
					})
					.onConflictDoUpdate({
						target: [Fans.email], // Only email is unique, not email+workspace
						set: {
							updatedAt: new Date(),
							emailMarketingOptIn: true,
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
				// Update existing fan's information
				// Only set appReferer if it's not already set
				await dbHttp
					.update(Fans)
					.set({
						updatedAt: new Date(),
						emailMarketingOptIn: true, // Ensure they're opted in
						...(existingFan.appReferer ? {} : { appReferer: 'vip' as const }),
					})
					.where(eq(Fans.id, existingFan.id));

				fanId = existingFan.id;
			}

			// Check if this fan is already linked to this workspace
			const existingLink = await dbHttp.query._Fans_To_Workspaces.findFirst({
				where: and(
					eq(_Fans_To_Workspaces.fanId, fanId),
					eq(_Fans_To_Workspaces.workspaceId, vipSwap.workspaceId),
				),
			});

			if (!existingLink) {
				// Link fan to workspace if not already linked
				try {
					await dbHttp.insert(_Fans_To_Workspaces).values({
						fanId,
						workspaceId: vipSwap.workspaceId,
					});
				} catch (error) {
					// Ignore if already exists (race condition)
					console.log('Fan-workspace link might already exist:', error);
				}
			}

			// Get workspace for sending context
			const workspace = await dbHttp.query.Workspaces.findFirst({
				where: eq(Workspaces.id, vipSwap.workspaceId),
			});

			// Build download URL with sessionId and fanId for cross-device tracking
			const downloadUrl = getAbsoluteUrl(
				'vip',
				`${handle}/unlock/${key}/download?token=${downloadToken}&sid=${sessionId}&fid=${fanId}`,
			);

			// Get artist name for personalization
			const artistName = workspace?.name ?? vipSwap.emailFromName ?? 'Artist';

			// Send email with download link
			const VipDownloadEmail = VipDownloadEmailTemplate({
				artistName,
				artistSupportEmail: workspace?.vipSupportEmail ?? undefined,
				swapName: vipSwap.name,
				downloadUrl,
				downloadTitle:
					vipSwap.downloadTitle ?? `🎵 Your exclusive ${vipSwap.name} download is ready!`,
				emailBody:
					vipSwap.emailBody ??
					`Thanks for being an early supporter of ${artistName}. As promised, here's your exclusive access to <i>${vipSwap.name}</i>. This download link will expire in ${
						expiryMinutes >= 1440 ?
							Math.round(expiryMinutes / 60 / 24) +
							' day' +
							(Math.round(expiryMinutes / 60 / 24) !== 1 ? 's' : '')
						: expiryMinutes >= 60 ?
							Math.round(expiryMinutes / 60) +
							' hour' +
							(Math.round(expiryMinutes / 60) !== 1 ? 's' : '')
						:	expiryMinutes + ' minutes'
					}, so grab it while it's hot!`,
				expiresIn: `${
					expiryMinutes >= 1440 ?
						Math.round(expiryMinutes / 60 / 24) +
						' day' +
						(Math.round(expiryMinutes / 60 / 24) !== 1 ? 's' : '')
					: expiryMinutes >= 60 ?
						Math.round(expiryMinutes / 60) +
						' hour' +
						(Math.round(expiryMinutes / 60) !== 1 ? 's' : '')
					:	expiryMinutes + ' minutes'
				}`,
			});

			// Send email first - if it fails, we won't create the access log
			await sendEmail({
				from: 'downloads@hello.barely.vip',
				fromFriendlyName: vipSwap.emailFromName ?? workspace?.name ?? 'Barely.vip',
				replyTo: workspace?.vipSupportEmail ?? undefined,
				to: email,
				subject:
					vipSwap.emailSubject && vipSwap.emailSubject.trim() !== '' ?
						vipSwap.emailSubject
					:	`Your exclusive ${vipSwap.name} download from ${artistName} is ready! 🎵`,
				type: 'transactional',
				react: VipDownloadEmail,
			});

			// Only create access log after email is sent successfully
			await dbHttp.insert(VipSwapAccessLogs).values({
				id: newId('vipSwapAccessLog'),
				vipSwapId: vipSwap.id,
				email,
				ipAddress: ctx.visitor?.ip ?? null,
				userAgent:
					typeof ctx.visitor?.userAgent === 'string' ?
						ctx.visitor.userAgent
					:	(ctx.visitor?.userAgent.ua ?? null),
				accessType: 'email_sent',
				downloadToken,
				downloadTokenExpiresAt,
				referrer: ctx.visitor?.referer ?? null,
				utmSource: utmParams.utm_source ?? null,
				utmMedium: utmParams.utm_medium ?? null,
				utmCampaign: utmParams.utm_campaign ?? null,
				utmTerm: utmParams.utm_term ?? null,
				utmContent: utmParams.utm_content ?? null,
			});

			// Record event to Tinybird and Meta after successful email and log creation
			await recordVipEvent({
				vipSwap,
				type: 'vip/emailCapture',
				visitor: ctx.visitor,
				workspace: vipSwap.workspace,
				emailCaptured: email,
			});

			return {
				success: true,
				message: 'Check your email for the download link!',
			};
		}),

	// Validate download token WITHOUT logging the download
	validateDownloadToken: publicProcedure
		.input(vipSwapDownloadTokenSchema)
		.query(async ({ input }) => {
			const { token } = input;

			// Find the access log with this token
			const accessLog = await dbHttp.query.VipSwapAccessLogs.findFirst({
				where: eq(VipSwapAccessLogs.downloadToken, token),
				with: {
					vipSwap: {
						with: {
							file: true,
							coverImage: true,
							workspace: true,
						},
					},
				},
			});

			if (!accessLog?.vipSwap.file) {
				throw new TRPCError({
					code: 'UNAUTHORIZED',
					message: 'Invalid download token',
				});
			}

			const { vipSwap } = accessLog;

			// Check if token expired
			if (
				accessLog.downloadTokenExpiresAt &&
				accessLog.downloadTokenExpiresAt < new Date()
			) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'Download link has expired',
				});
			}

			// Check download limit if configured
			if (vipSwap.downloadLimit) {
				const downloadCount = await dbHttp.query.VipSwapAccessLogs.findMany({
					where: and(
						eq(VipSwapAccessLogs.vipSwapId, vipSwap.id),
						eq(VipSwapAccessLogs.email, accessLog.email),
						eq(VipSwapAccessLogs.accessType, 'download'),
					),
				});

				if (downloadCount.length >= vipSwap.downloadLimit) {
					throw new TRPCError({
						code: 'FORBIDDEN',
						message: 'Maximum downloads reached for this email',
					});
				}
			}

			// Return file info WITHOUT logging the download yet
			return {
				fileUrl: vipSwap.file.src,
				fileName: vipSwap.file.name,
				fileType: vipSwap.file.type,
				fileSize: vipSwap.file.size,
				swap: {
					id: vipSwap.id,
					name: vipSwap.name,
					description: vipSwap.description,
					coverImage: vipSwap.coverImage,
					workspace: vipSwap.workspace,
				},
				email: accessLog.email,
			};
		}),

	// Log the actual download when user clicks download button
	getDownloadUrl: publicProcedure
		.input(vipSwapDownloadTokenSchema)
		.query(async ({ ctx, input }) => {
			const { token } = input;

			// Find the access log with this token
			const accessLog = await dbHttp.query.VipSwapAccessLogs.findFirst({
				where: eq(VipSwapAccessLogs.downloadToken, token),
				with: {
					vipSwap: {
						with: {
							file: true,
							coverImage: true,
							workspace: true,
						},
					},
				},
			});

			if (!accessLog?.vipSwap.file) {
				throw new TRPCError({
					code: 'UNAUTHORIZED',
					message: 'Invalid download token',
				});
			}

			const { vipSwap } = accessLog;

			// Check if token expired
			if (
				accessLog.downloadTokenExpiresAt &&
				accessLog.downloadTokenExpiresAt < new Date()
			) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'Download link has expired',
				});
			}

			// Check download limit if configured
			if (vipSwap.downloadLimit) {
				// Count how many times this specific token has been downloaded
				const downloadCount = await dbHttp.query.VipSwapAccessLogs.findMany({
					where: and(
						eq(VipSwapAccessLogs.vipSwapId, vipSwap.id),
						eq(VipSwapAccessLogs.email, accessLog.email),
						eq(VipSwapAccessLogs.accessType, 'download'),
					),
				});

				if (downloadCount.length >= vipSwap.downloadLimit) {
					throw new TRPCError({
						code: 'FORBIDDEN',
						message: 'Maximum downloads reached for this email',
					});
				}
			}

			// Create a new log entry for the actual download (separate from email_sent)
			// The sessionId and fanId should be in the visitor context from the middleware
			await dbHttp.insert(VipSwapAccessLogs).values({
				id: newId('vipSwapAccessLog'),
				vipSwapId: vipSwap.id,
				email: accessLog.email,
				ipAddress: ctx.visitor?.ip ?? accessLog.ipAddress,
				userAgent:
					typeof ctx.visitor?.userAgent === 'string' ?
						ctx.visitor.userAgent
					:	(ctx.visitor?.userAgent.ua ?? accessLog.userAgent),
				accessType: 'download',
				downloadedAt: new Date(),
				referrer: ctx.visitor?.referer ?? null,
			});

			// Record event to Tinybird and Meta with proper session context
			// The visitor object should already have sessionId and fanId from middleware/query params
			await recordVipEvent({
				vipSwap,
				type: 'vip/download',
				visitor: ctx.visitor,
				workspace: vipSwap.workspace,
				downloadToken: token,
				email: accessLog.email,
				fanId: ctx.visitor?.fanId ?? null,
			});

			return {
				fileUrl: vipSwap.file.src,
				fileName: vipSwap.file.name,
				fileType: vipSwap.file.type,
				fileSize: vipSwap.file.size,
				swap: {
					id: vipSwap.id,
					name: vipSwap.name,
					description: vipSwap.description,
					coverImage: vipSwap.coverImage,
					workspace: vipSwap.workspace,
				},
			};
		}),

	// Log page view
	log: publicProcedure
		.input(
			z.object({
				vipSwapId: z.string(),
				type: z.literal('vip/view'),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			console.log('ctx.visitor', ctx.visitor);

			const vipSwap = await dbHttp.query.VipSwaps.findFirst({
				where: and(eq(VipSwaps.id, input.vipSwapId), eq(VipSwaps.isActive, true)),
				with: {
					workspace: true,
				},
			});

			// console.log('vipSwap to log', vipSwap);

			if (!vipSwap?.workspace) {
				return;
			}

			// Record event to Tinybird and Meta
			await recordVipEvent({
				vipSwap,
				type: input.type,
				visitor: ctx.visitor,
				workspace: vipSwap.workspace,
			});

			// Create access log for page view
			await dbHttp.insert(VipSwapAccessLogs).values({
				id: newId('vipSwapAccessLog'),
				vipSwapId: vipSwap.id,
				email: 'anonymous',
				ipAddress: ctx.visitor?.ip ?? null,
				userAgent:
					typeof ctx.visitor?.userAgent === 'string' ?
						ctx.visitor.userAgent
					:	(ctx.visitor?.userAgent.ua ?? null),
				accessType: 'page_view',
				referrer: ctx.visitor?.referer ?? null,
			});
		}),
} satisfies TRPCRouterRecord;

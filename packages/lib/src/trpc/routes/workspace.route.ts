import type { TRPCRouterRecord } from '@trpc/server';
import { WORKSPACE_PLAN_TYPES } from '@barely/const';
import { dbHttp } from '@barely/db/client';
import { dbPool } from '@barely/db/pool';
import { BrandKits } from '@barely/db/sql/brand-kit.sql';
import { CartFunnels } from '@barely/db/sql/cart-funnel.sql';
import {
	_Files_To_Workspaces__AvatarImage,
	_Files_To_Workspaces__HeaderImage,
} from '@barely/db/sql/file.sql';
import { LandingPages } from '@barely/db/sql/landing-page.sql';
import { PressKits } from '@barely/db/sql/press-kit.sql';
import { _Users_To_Workspaces } from '@barely/db/sql/user.sql';
import { WorkspaceInvites } from '@barely/db/sql/workspace-invite.sql';
import { Workspaces } from '@barely/db/sql/workspace.sql';
import { sqlAnd, sqlStringContains } from '@barely/db/utils';
import { newId, raiseTRPCError } from '@barely/utils';
import {
	createWorkspaceSchema,
	updateCurrentWorkspaceSchema,
	updateWorkspaceSpotifyArtistIdSchema,
	workspaceAssetsSchema,
} from '@barely/validators';
import { NeonDbError } from '@neondatabase/serverless';
import { tasks } from '@trigger.dev/sdk/v3';
import { TRPCError } from '@trpc/server';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { z } from 'zod/v4';

import type { generateFileBlurHash } from '../../trigger';
import { pushEvent } from '../../integrations/pusher/pusher-server';
import { privateProcedure, publicProcedure, workspaceProcedure } from '../trpc';

export const workspaceRoute = {
	byHandle: workspaceProcedure.query(({ ctx }) => ctx.workspace),

	byHandleWithAll: workspaceProcedure.query(async ({ ctx }) => {
		const workspace = await dbHttp.query.Workspaces.findFirst({
			where: eq(Workspaces.handle, ctx.workspace.handle),
		});

		if (!workspace) raiseTRPCError({ message: 'Workspace not found' });

		return workspace;
	}),

	nameById: publicProcedure.input(z.string()).query(async ({ input }) => {
		const workspace = await dbHttp.query.Workspaces.findFirst({
			where: eq(Workspaces.id, input),
		});

		return workspace?.name;
	}),

	assets: workspaceProcedure
		.input(workspaceAssetsSchema)
		.query(async ({ input, ctx }) => {
			const { types } = input;
			const search = input.search?.length ? input.search : null;

			const cartFunnels =
				!types || types.includes('cartFunnel') ?
					await dbHttp.query.CartFunnels.findMany({
						where: sqlAnd([
							eq(CartFunnels.workspaceId, ctx.workspace.id),
							search ? sqlStringContains(CartFunnels.name, search) : null,
						]),
						limit: 20,
					})
				:	[];

			const pressKits =
				!types || types.includes('pressKit') ?
					await dbHttp.query.PressKits.findMany({
						where: sqlAnd([eq(PressKits.workspaceId, ctx.workspace.id)]),
						limit: 20,
					})
				:	[];

			const landingPages =
				!types || types.includes('landingPage') ?
					await dbHttp.query.LandingPages.findMany({
						where: sqlAnd([
							eq(LandingPages.workspaceId, ctx.workspace.id),
							search?.length ? sqlStringContains(LandingPages.name, search) : null,
						]),
						limit: 20,
					})
				:	[];

			const assets = [
				...cartFunnels.map(cf => ({ type: 'cartFunnel', id: cf.id, name: cf.name })),
				...pressKits.map(pk => ({ type: 'pressKit', id: pk.id, name: 'Press Kit' })),
				...landingPages.map(lp => ({ type: 'landingPage', id: lp.id, name: lp.name })),
			];

			return assets;
		}),

	members: workspaceProcedure.query(async ({ ctx }) => {
		console.log('members ctx.workspace.id => ', ctx.workspace.id);
		console.log('members ctx.workspace.handle => ', ctx.workspace.handle);

		const members = await dbHttp.query._Users_To_Workspaces.findMany({
			where: eq(_Users_To_Workspaces.workspaceId, ctx.workspace.id),
			limit: 20,
			with: {
				user: true,
			},
		});

		console.log('members => ', members);

		return members.map(m => ({
			...m.user,
			role: m.role,
		}));
	}),

	invites: workspaceProcedure.query(async ({ ctx }) => {
		const invites = await dbHttp.query.WorkspaceInvites.findMany({
			where: and(
				eq(WorkspaceInvites.workspaceId, ctx.workspace.id),
				gt(WorkspaceInvites.expiresAt, new Date()),
				isNull(WorkspaceInvites.acceptedAt),
				isNull(WorkspaceInvites.declinedAt),
			),
		});

		return invites;
	}),

	create: privateProcedure
		.input(createWorkspaceSchema)
		.mutation(async ({ ctx, input }) => {
			const workspaceId = newId('workspace');

			const newWorkspace = {
				id: newId('workspace'),
				...input,
			};

			await dbPool(ctx.pool).transaction(async tx => {
				await tx.insert(Workspaces).values({
					id: workspaceId,
					...input,
				});
				await tx.insert(_Users_To_Workspaces).values({
					userId: ctx.user.id,
					workspaceId: workspaceId,
					role: 'owner',
				});
			});

			return newWorkspace;
		}),

	bySpotifyId: publicProcedure.input(z.string()).query(async ({ input }) => {
		const artistTeam = await dbHttp.query.Workspaces.findFirst({
			where: eq(Workspaces.spotifyArtistId, input),
		});

		console.log('artistTeam => ', artistTeam);

		if (!artistTeam) return null;

		return artistTeam;
	}),

	spotifyArtistIdTaken: publicProcedure.input(z.string()).query(async ({ input }) => {
		const artistTeam = await dbHttp.query.Workspaces.findFirst({
			where: eq(Workspaces.spotifyArtistId, input),
		});

		return !!artistTeam;
	}),

	update: workspaceProcedure
		.input(updateCurrentWorkspaceSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				const updatedWorkspace = await dbHttp
					.update(Workspaces)
					.set(input)
					.where(eq(Workspaces.id, ctx.workspace.id));

				// refresh the current workspace session
				// await ctx.getRefreshedSession();

				try {
					await pushEvent('workspace', 'update', {
						id: ctx.workspace.id,
						pageSessionId: ctx.pageSessionId,
						socketId: ctx.pusherSocketId,
					});
				} catch (error) {
					console.error('error pushing workspace update event => ', error);
				}

				return updatedWorkspace;
			} catch (err) {
				console.log('update ws error => ', err);

				if (err instanceof NeonDbError) {
					console.log('NeonDbError => ', err);
				}
			}
		}),

	updateSpotifyArtistId: workspaceProcedure
		.input(updateWorkspaceSpotifyArtistIdSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				const updatedWorkspace = await dbHttp
					.update(Workspaces)
					.set({ spotifyArtistId: input.spotifyArtistId })
					.where(eq(Workspaces.id, ctx.workspace.id));

				return updatedWorkspace;
			} catch {
				// check if the spotifyArtistId is already taken (only if not null)
				if (input.spotifyArtistId) {
					const isTaken = await dbHttp.query.Workspaces.findFirst({
						where: eq(Workspaces.spotifyArtistId, input.spotifyArtistId),
					});

					if (isTaken) {
						throw new TRPCError({
							code: 'CONFLICT',
							message: 'This Spotify artist is already connected to another workspace.',
						});
					}
				}

				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message:
						'An error occurred while adding the Spotify artist. Please try again later or reach out to support.',
				});
			}
		}),

	updateAvatar: workspaceProcedure
		.input(
			z.object({
				avatarFileId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			console.log('updateAvatar input => ', input);
			// console.log('updateAvatar ctx => ', ctx);
			// check if there is already a default workspace avatar
			const defaultAvatar = await dbPool(ctx.pool)
				.query._Files_To_Workspaces__AvatarImage.findFirst({
					where: and(
						eq(_Files_To_Workspaces__AvatarImage.workspaceId, ctx.workspace.id),
						eq(_Files_To_Workspaces__AvatarImage.current, true),
					),
				})
				.catch(console.error);

			console.log('defaultAvatar => ', defaultAvatar);

			// set the current default avatar to false
			if (defaultAvatar) {
				await dbPool(ctx.pool)
					.update(_Files_To_Workspaces__AvatarImage)
					.set({
						current: false,
					})
					.where(and(eq(_Files_To_Workspaces__AvatarImage.workspaceId, ctx.workspace.id)))
					.catch(console.error);

				console.log('set the current default avatar to false 👍');
			}

			// set the new avatar as the default
			await dbPool(ctx.pool)
				.insert(_Files_To_Workspaces__AvatarImage)
				.values({
					workspaceId: ctx.workspace.id,
					fileId: input.avatarFileId,
					current: true,
				})
				.onConflictDoUpdate({
					target: [
						_Files_To_Workspaces__AvatarImage.workspaceId,
						_Files_To_Workspaces__AvatarImage.fileId,
					],
					set: { current: true },
				})
				.catch(console.error);

			try {
				await pushEvent('workspace', 'update', {
					id: ctx.workspace.id,
					pageSessionId: ctx.pageSessionId,
				});

				// console.log('pushed event', pushRes);
			} catch (e) {
				console.error('error pushing workspace update event => ', e);
			}

			// update the brand kit avatar s3 key
			await dbPool(ctx.pool)
				.update(BrandKits)
				.set({ avatarS3Key: input.avatarFileId })
				.where(eq(BrandKits.workspaceId, ctx.workspace.id));

			// trigger the blur hash generation
			await tasks.trigger<typeof generateFileBlurHash>('generate-file-blur-hash', {
				fileId: input.avatarFileId,
				s3Key: input.avatarFileId,
				avatarWorkspaceId: ctx.workspace.id,
			});

			return true;
		}),

	updateHeader: workspaceProcedure
		.input(
			z.object({
				headerFileId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// check if there is already a default workspace header
			const defaultHeader = await dbPool(
				ctx.pool,
			).query._Files_To_Workspaces__HeaderImage.findFirst({
				where: and(
					eq(_Files_To_Workspaces__HeaderImage.workspaceId, ctx.workspace.id),
					eq(_Files_To_Workspaces__HeaderImage.current, true),
				),
			});

			// set the current default header to false
			if (defaultHeader) {
				await dbPool(ctx.pool)
					.update(_Files_To_Workspaces__HeaderImage)
					.set({
						current: false,
					})
					.where(
						and(eq(_Files_To_Workspaces__HeaderImage.workspaceId, ctx.workspace.id)),
					);
			}

			// set the new header as the default
			await dbPool(ctx.pool)
				.insert(_Files_To_Workspaces__HeaderImage)
				.values({
					workspaceId: ctx.workspace.id,
					fileId: input.headerFileId,
					current: true,
				})
				.onConflictDoUpdate({
					target: [
						_Files_To_Workspaces__HeaderImage.workspaceId,
						_Files_To_Workspaces__HeaderImage.fileId,
					],
					set: { current: true },
				});

			// update the brand kit header s3 key
			await dbPool(ctx.pool)
				.update(BrandKits)
				.set({ headerS3Key: input.headerFileId })
				.where(eq(BrandKits.workspaceId, ctx.workspace.id));

			// trigger the blur hash generation
			await tasks.trigger<typeof generateFileBlurHash>('generate-file-blur-hash', {
				fileId: input.headerFileId,
				s3Key: input.headerFileId,
				headerWorkspaceId: ctx.workspace.id,
			});

			try {
				const pushRes = await pushEvent('workspace', 'update', {
					id: ctx.workspace.id,
					pageSessionId: ctx.pageSessionId,
				});

				console.log('pushed event', pushRes);
			} catch (e) {
				console.error('e => ', e);
			}

			return true;
		}),

	upgradePlan: workspaceProcedure
		.input(
			z.object({
				planId: z.enum(WORKSPACE_PLAN_TYPES),
				billingCycle: z.enum(['monthly', 'yearly']),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Dynamic import to avoid loading stripe in every request
			const { createUpgradeUrl } = await import('../../functions/workspace-stripe.fns');

			console.log('workspace => ', ctx.workspace);

			return createUpgradeUrl({
				workspace: ctx.workspace,
				user: ctx.user,
				planId: input.planId,
				billingCycle: input.billingCycle,
			});
		}),
} satisfies TRPCRouterRecord;

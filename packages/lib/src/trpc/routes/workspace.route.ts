import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { dbPool } from '@barely/db/pool';
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
import { newId, raise } from '@barely/utils';
import {
	createWorkspaceSchema,
	updateCurrentWorkspaceSchema,
	workspaceAssetsSchema,
} from '@barely/validators';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { z } from 'zod/v4';

import { pushEvent } from '../../integrations/pusher/pusher-server';
import { privateProcedure, publicProcedure, workspaceProcedure } from '../trpc';

export const workspaceRoute = {
	// byHandle: privateProcedure
	// 	.input(z.object({ handle: z.string() }))
	// 	.query(async ({ input, ctx }) => {
	// 		const workspace = await dbHttp.query.Workspaces.findFirst({
	// 			where: and(
	// 				eq(Workspaces.handle, input.handle),
	// 				inArray(
	// 					Workspaces.id,
	// 					ctx.user.workspaces.map(w => w.id),
	// 				),ππ
	// 			),
	// 		});

	// 		return workspace;
	// 	}),
	byHandle: workspaceProcedure.query(({ ctx }) => {
		// if (!ctx.workspace) return null;
		return ctx.workspace;
	}),

	byHandleWithAll: workspaceProcedure.query(async ({ ctx }) => {
		const workspace = await dbHttp.query.Workspaces.findFirst({
			where: eq(Workspaces.handle, ctx.workspace.handle),
		});

		if (!workspace) raise('Workspace not found');

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
			const updatedWorkspace = await dbHttp
				.update(Workspaces)
				.set(input)
				.where(eq(Workspaces.id, ctx.workspace.id));

			await pushEvent('workspace', 'update', {
				id: ctx.workspace.id,
				pageSessionId: ctx.pageSessionId,
				socketId: ctx.pusherSocketId,
			});

			return updatedWorkspace;
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

	// these procedures import larger libraries (stripe, react-email)
	// createCheckoutLink: privateProcedure
	// 	.input(
	// 		z.object({
	// 			planId: z.enum(['pro']),
	// 			billingCycle: z.enum(['monthly', 'yearly']),
	// 			successPath: z.string().optional(),
	// 			cancelPath: z.string().optional(),
	// 		}),
	// 	)
	// 	.mutation(async ({ ctx, input }) => {
	// 		const checkoutLink = await createPlanCheckoutLink({
	// 			user: ctx.user,
	// 			workspace: ctx.workspace,
	// 			db: ctx.db,
	// 			...input,
	// 		});

	// 		return checkoutLink;
	// 	}),

	// inviteMember: privateProcedure
	// 	.input(inviteMemberSchema)
	// 	.mutation(async ({ ctx, input }) => {
	// 		await inviteUserToWorkspace({
	// 			email: input.email,
	// 			workspace: ctx.workspace,
	// 			inviter: ctx.user,
	// 			role: input.role,
	// 		});
	// 	}),
} satisfies TRPCRouterRecord;

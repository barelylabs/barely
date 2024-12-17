import { and, eq, gt } from 'drizzle-orm';
import { z } from 'zod';

import { newId } from '../../../utils/id';
import { pushEvent } from '../../../utils/pusher-server';
import { sqlAnd, sqlStringContains } from '../../../utils/sql';
import {
	createTRPCRouter,
	privateProcedure,
	publicProcedure,
	workspaceQueryProcedure,
} from '../../api/trpc';
import { CartFunnels } from '../cart-funnel/cart-funnel.sql';
import {
	_Files_To_Workspaces__AvatarImage,
	_Files_To_Workspaces__HeaderImage,
} from '../file/file.sql';
import { LandingPages } from '../landing-page/landing-page.sql';
import { PressKits } from '../press-kit/press-kit.sql';
import { _Users_To_Workspaces } from '../user/user.sql';
import { WorkspaceInvites } from '../workspace-invite/workspace-invite.sql';
import {
	createWorkspaceSchema,
	updateCurrentWorkspaceSchema,
	workspaceAssetsSchema,
} from './workspace.schema';
import { Workspaces } from './workspace.sql';

export const workspaceRouter = createTRPCRouter({
	// byHandle: privateProcedure
	// 	.input(z.object({ handle: z.string() }))
	// 	.query(async ({ input, ctx }) => {
	// 		const workspace = await ctx.db.http.query.Workspaces.findFirst({
	// 			where: and(
	// 				eq(Workspaces.handle, input.handle),
	// 				inArray(
	// 					Workspaces.id,
	// 					ctx.user.workspaces.map(w => w.id),
	// 				),
	// 			),
	// 		});

	// 		return workspace;
	// 	}),

	current: privateProcedure.query(({ ctx }) => {
		if (!ctx.workspace) return null;
		return ctx.workspace;
	}),

	assets: workspaceQueryProcedure
		.input(workspaceAssetsSchema)
		.query(async ({ input, ctx }) => {
			const { types } = input;
			const search = input.search?.length ? input.search : null;

			const cartFunnels =
				!types || types.includes('cartFunnel') ?
					await ctx.db.http.query.CartFunnels.findMany({
						where: sqlAnd([
							eq(CartFunnels.workspaceId, ctx.workspace.id),
							search ? sqlStringContains(CartFunnels.name, search) : null,
						]),
						limit: 20,
					})
				:	[];

			const pressKits =
				!types || types.includes('pressKit') ?
					await ctx.db.http.query.PressKits.findMany({
						where: sqlAnd([eq(PressKits.workspaceId, ctx.workspace.id)]),
						limit: 20,
					})
				:	[];

			const landingPages =
				!types || types.includes('landingPage') ?
					await ctx.db.http.query.LandingPages.findMany({
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

	members: workspaceQueryProcedure.query(async ({ ctx }) => {
		const members = await ctx.db.http.query._Users_To_Workspaces.findMany({
			where: eq(_Users_To_Workspaces.workspaceId, ctx.workspace.id),
			limit: 20,
			with: {
				user: true,
			},
		});

		return members.map(m => ({
			...m.user,
			role: m.role,
		}));
	}),

	invites: workspaceQueryProcedure.query(async ({ ctx }) => {
		const invites = await ctx.db.http.query.WorkspaceInvites.findMany({
			where: and(
				eq(WorkspaceInvites.workspaceId, ctx.workspace.id),
				gt(WorkspaceInvites.expiresAt, new Date()),
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

			await ctx.db.pool.transaction(async tx => {
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

	bySpotifyId: publicProcedure.input(z.string()).query(async ({ input, ctx }) => {
		const artistTeam = await ctx.db.http.query.Workspaces.findFirst({
			where: eq(Workspaces.spotifyArtistId, input),
		});

		console.log('artistTeam => ', artistTeam);

		if (!artistTeam) return null;

		return artistTeam;
	}),

	spotifyArtistIdTaken: publicProcedure
		.input(z.string())
		.query(async ({ input, ctx }) => {
			const artistTeam = await ctx.db.http.query.Workspaces.findFirst({
				where: eq(Workspaces.spotifyArtistId, input),
			});

			return !!artistTeam;
		}),

	update: privateProcedure
		.input(updateCurrentWorkspaceSchema)
		.mutation(async ({ ctx, input }) => {
			const updatedWorkspace = await ctx.db.http
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

	updateAvatar: privateProcedure
		.input(
			z.object({
				avatarFileId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			console.log('updateAvatar input => ', input);
			// console.log('updateAvatar ctx => ', ctx);
			// check if there is already a default workspace avatar
			const defaultAvatar = await ctx.db.pool.query._Files_To_Workspaces__AvatarImage
				.findFirst({
					where: and(
						eq(_Files_To_Workspaces__AvatarImage.workspaceId, ctx.workspace.id),
						eq(_Files_To_Workspaces__AvatarImage.current, true),
					),
				})
				.catch(console.error);

			console.log('defaultAvatar => ', defaultAvatar);

			// set the current default avatar to false
			if (defaultAvatar) {
				await ctx.db.pool
					.update(_Files_To_Workspaces__AvatarImage)
					.set({
						current: false,
					})
					.where(and(eq(_Files_To_Workspaces__AvatarImage.workspaceId, ctx.workspace.id)))
					.catch(console.error);

				console.log('set the current default avatar to false 👍');
			}

			// set the new avatar as the default
			await ctx.db.pool
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

	updateHeader: privateProcedure
		.input(
			z.object({
				headerFileId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// check if there is already a default workspace header
			const defaultHeader =
				await ctx.db.pool.query._Files_To_Workspaces__HeaderImage.findFirst({
					where: and(
						eq(_Files_To_Workspaces__HeaderImage.workspaceId, ctx.workspace.id),
						eq(_Files_To_Workspaces__HeaderImage.current, true),
					),
				});

			// set the current default header to false
			if (defaultHeader) {
				await ctx.db.pool
					.update(_Files_To_Workspaces__HeaderImage)
					.set({
						current: false,
					})
					.where(
						and(eq(_Files_To_Workspaces__HeaderImage.workspaceId, ctx.workspace.id)),
					);
			}

			// set the new header as the default
			await ctx.db.pool
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
});

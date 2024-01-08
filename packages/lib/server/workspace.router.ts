import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { dbRead } from '../utils/db';
import { newId } from '../utils/id';
import { privateProcedure, publicProcedure, router } from './api';
import { createPlanCheckoutLink } from './stripe.fns';
import { _Users_To_Workspaces } from './user.sql';
import { createWorkspaceSchema, updateWorkspaceSchema } from './workspace.schema';
import { Workspaces } from './workspace.sql';

export const workspaceRouter = router({
	current: privateProcedure.query(({ ctx }) => {
		if (!ctx.workspace) return null;
		return ctx.workspace;
	}),

	create: privateProcedure
		.input(createWorkspaceSchema)
		.mutation(async ({ ctx, input }) => {
			const workspaceId = newId('workspace');

			const newWorkspace = {
				id: newId('workspace'),
				...input,
			};

			await ctx.db.writePool.transaction(async tx => {
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
		const artistTeam = await dbRead(ctx.db).query.Workspaces.findFirst({
			where: eq(Workspaces.spotifyArtistId, input),
		});

		console.log('artistTeam => ', artistTeam);

		if (!artistTeam) return null;

		// if (!ctx.user?.id)
		// 	throw new TRPCError({
		// 		code: 'UNAUTHORIZED',
		// 		message: `You must be logged in as a member of ${artistTeam.name}'s team to create a new campaign for them.`,
		// 	});

		// const userIsAdmin = ctx.user?.teams.map(t => t.id).includes(artistTeam.id);

		// if (!userIsAdmin)
		// 	throw new TRPCError({
		// 		code: 'UNAUTHORIZED',
		// 		message: `You must have admin access to ${artistTeam.name}'s team to create a new campaign for them. Contact someone on the team to get access.`,
		// 	});

		return artistTeam;
	}),

	update: privateProcedure
		.input(updateWorkspaceSchema)
		.mutation(async ({ ctx, input }) => {
			if (input.id !== ctx.workspace?.id) {
				throw new Error('Workspace ID does not match the current context');
			}

			const updatedWorkspace = await ctx.db.write
				.update(Workspaces)
				.set(input)
				.where(eq(Workspaces.id, ctx.workspace.id));

			return updatedWorkspace;
		}),

	createCheckoutLink: privateProcedure
		.input(
			z.object({
				planId: z.enum(['pro']),
				billingCycle: z.enum(['monthly', 'yearly']),
				successPath: z.string().optional(),
				cancelPath: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const checkoutLink = await createPlanCheckoutLink({
				user: ctx.user,
				workspace: ctx.workspace,
				db: ctx.db,
				...input,
			});

			return checkoutLink;
		}),

	// uploadAvatar: privateProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
	// 	const { secure_url } = await upload(input, {
	// 		public_id: ctx.workspace.id,
	// 		folder: 'avatars',
	// 		overwrite: true,
	// 		invalidate: true,
	// 	});

	// 	await ctx.db.write
	// 		.update(Workspaces)
	// 		.set({ imageUrl: secure_url })
	// 		.where(eq(Workspaces.id, ctx.workspace.id));

	// 	return secure_url;
	// }),
});

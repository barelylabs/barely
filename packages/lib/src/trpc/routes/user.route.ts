import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { Users, WorkspaceInvites } from '@barely/db/sql';
import { createUserSchema } from '@barely/validators';
import { parseForDb } from '@barely/validators/helpers';
import { eq } from 'drizzle-orm';
import { z } from 'zod/v4';

import { checkEmailExistsOnServer, createUser } from '../../functions/user.fns';
import { privateProcedure, publicProcedure } from '../trpc';

export const userRoute = {
	create: publicProcedure.input(createUserSchema).mutation(async ({ input }) => {
		const { inviteToken, ...userInput } = input;
		const newUser = await createUser({ ...userInput, inviteToken });

		// Important: Don't try to create magic tokens manually - Better Auth needs to handle this
		// The client will send the magic link email after user creation
		return newUser;
	}),

	current: publicProcedure.query(async ({ ctx }) => {
		if (!ctx.user) return null;

		const user = await dbHttp
			.select()
			.from(Users)
			.where(eq(Users.id, ctx.user.id))
			.limit(1)
			.then(users => users[0]);

		return user;
	}),

	workspaceInvites: privateProcedure.query(({ ctx }) => {
		const invites = dbHttp.query.WorkspaceInvites.findMany({
			where: eq(WorkspaceInvites.userId, ctx.user.id),
			with: {
				workspace: true,
			},
		});

		return invites;
	}),

	workspaces: privateProcedure.query(({ ctx }) => {
		return ctx.user.workspaces;
	}),

	emailExists: publicProcedure
		.meta({ openapi: { method: 'GET', path: '/user/email-exists' } })
		.input(z.object({ email: z.string() }))
		.output(z.boolean())
		.query(async ({ input }) => {
			console.log('checking email exists on the server');
			return await checkEmailExistsOnServer(input.email);
		}),

	phoneExists: publicProcedure
		.meta({ openapi: { method: 'GET', path: '/user/phone-number-exists' } })
		.input(z.object({ phone: z.string() }))
		.output(z.boolean())
		.query(async ({ input }) => {
			console.log('checking for phone number', parseForDb(input.phone));
			const user = await dbHttp
				.select()
				.from(Users)
				.where(eq(Users.phone, parseForDb(input.phone)))
				.limit(1)
				.then(users => users[0]);

			console.log('user => ', user);

			if (!user) return false;
			return true;
		}),
} satisfies TRPCRouterRecord;

import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { parseForDb } from '../../../utils/phone-number';
import { createTRPCRouter, privateProcedure, publicProcedure } from '../../api/trpc';
import { checkEmailExistsOnServer, createUser } from './user.fns';
import { createUserSchema } from './user.schema';
import { Users } from './user.sql';

const userRouter = createTRPCRouter({
	create: publicProcedure.input(createUserSchema).mutation(async ({ input }) => {
		const newUser = await createUser({ ...input });

		return newUser;
	}),

	current: publicProcedure.query(async ({ ctx }) => {
		if (!ctx.user) return null;

		const user = await ctx.db.http
			.select()
			.from(Users)
			.where(eq(Users.id, ctx.user.id))
			.limit(1)
			.then(users => users[0]);

		return user;
	}),

	workspaceInvites: privateProcedure.query(({ ctx }) => {
		return ctx.user.workspaceInvites ?? [];
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
		.query(async ({ ctx, input }) => {
			console.log('checking for phone number', parseForDb(input.phone));
			const user = await ctx.db.http
				.select()
				.from(Users)
				.where(eq(Users.phone, parseForDb(input.phone)))
				.limit(1)
				.then(users => users[0]);

			console.log('user => ', user);

			if (!user) return false;
			return true;
		}),
});

export { userRouter };

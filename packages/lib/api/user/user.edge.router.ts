import { z } from 'zod';

import { parseForDb } from '../../utils/edge/phone-number';
import { publicProcedure, router } from '../trpc';

const userRouter = router({
	current: publicProcedure.query(async ({ ctx }) => {
		console.log('current user ctx.user: ', ctx.user);
		if (!ctx.user) return null;

		const user = await ctx.kyselyRead
			.selectFrom('User')
			.selectAll()
			.where('id', '=', ctx.user.id)
			.executeTakeFirst();

		return user;
	}),

	emailExists: publicProcedure
		.input(z.object({ email: z.string() }))
		.query(async ({ ctx, input }) => {
			console.log('email exists?');

			const user = await ctx.kyselyRead
				.selectFrom('User')
				.select('id')
				.where('email', '=', input.email)
				.executeTakeFirst();

			return !!user;
		}),

	phoneExists: publicProcedure
		.input(z.object({ phone: z.string() }))
		.query(async ({ ctx, input }) => {
			const user = await ctx.kyselyRead
				.selectFrom('User')
				.select('id')
				.where('phone', '=', parseForDb(input.phone))
				.executeTakeFirst();

			return !!user;
		}),
});

export { userRouter };

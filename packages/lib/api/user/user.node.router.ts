// import { z } from 'zod';

import { publicProcedure, router } from '../trpc';
import { createUser } from './user.node.fns';
import { userContactInfoSchema } from './user.schema';

const userRouter = router({
	// emailExists: publicProcedure
	// 	.input(z.object({ email: z.string() }))
	// 	.query(async ({ ctx, input }) => {
	// 		console.log('email exists?');

	// 		const user = await ctx.kyselyRead
	// 			.selectFrom('User')
	// 			.select('id')
	// 			.where('email', '=', input.email)
	// 			.executeTakeFirst();

	// 		return !!user;
	// 	}),
	create: publicProcedure.input(userContactInfoSchema).mutation(async ({ input }) => {
		console.log('creating user', input);
		const newUser = await createUser(input);
		console.log('created user', newUser);
		return newUser;
	}),
});

export { userRouter };

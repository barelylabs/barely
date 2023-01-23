import { router, publicProcedure, privateProcedure } from '../trpc';

export const authRouter = router({
	getUser: publicProcedure.query(({ ctx }) => {
		// console.log("ctx => ", ctx);
		return ctx.user;
	}),
});

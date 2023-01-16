import { Context } from './context';
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';

const t = initTRPC.context<Context>().create({
	transformer: superjson,
	errorFormatter({ shape, error }) {
		return {
			...shape,
			data: {
				...shape.data,
				zod: error.cause instanceof ZodError ? error.cause.flatten().fieldErrors : null,
			},
		};
	},
});

export const mergeRouters = t.mergeRouters;
export const middleware = t.middleware;
export const router = t.router;

export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(opts => {
	if (!opts.ctx.user) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'You have to be logged in to do this.',
		});
	}
	return opts.next({
		ctx: {
			user: opts.ctx.user,
		},
	});
});

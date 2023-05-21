// import { NextRequest, NextResponse } from 'next/server';

import { inferAsyncReturnType, initTRPC, TRPCError } from '@trpc/server';
import { CreateNextContextOptions } from '@trpc/server/adapters/next';
import { Session } from 'next-auth';
import { getToken } from 'next-auth/jwt';
// import Pusher from 'pusher';
import superjson from 'superjson';
/**
 * 🎬 INITIALIZATION
 */
import { OpenApiMeta } from 'trpc-openapi';
import { ZodError } from 'zod';

/**
 * 🎁 CONTEXT
 */
import { closestKyselyRead, kyselyWrite } from '@barely/db/kysely/kysely.db';

// import { getServerSessionAPI, type Session } from '../auth';
import { getUserFromToken } from '../auth/get-session-from-token';

// import { pusher } from './pusher';

interface CreateInnerContextProps {
	// session: Session | null;
	user: Session['user'] | null;
	pageSessionId: string | undefined;
	longitude?: string | number;
	latitude?: string | number;
}

const createInnerTRPCContext = (opts: CreateInnerContextProps) => {
	const kyselyRead = closestKyselyRead(opts.longitude, opts.latitude);

	return {
		// session: opts.session,
		user: opts.user,
		pageSessionId: opts.pageSessionId,
		kyselyRead,
		kyselyWrite,
	};
};

type CreateContextProps = CreateNextContextOptions;

const createTRPCContext = async (opts: CreateContextProps) => {
	const { req } = opts;

	// const session = await getServerSessionAPI({ req, res });
	const token = await getToken({ req });

	const user = token ? getUserFromToken(token) : null;

	// if (token) {
	// 	// console.log('json web token', JSON.stringify(token, null, 2));
	// 	const user = getUserFromToken(token);
	// 	// console.log('jwt user', user);
	// } else {
	// 	// console.log('no json web token');
	// }
	// console.log('session in createTRPCContext', session);

	return createInnerTRPCContext({
		// session,
		// user: session?.user ?? null,
		user,
		pageSessionId: req.headers['x-page-session-id'] as string | undefined,
		longitude: req.headers['x-longitude'] as string | number | undefined,
		latitude: req.headers['x-latitude'] as string | number | undefined,
		// pusher,
	});
};

type TRPCContext = inferAsyncReturnType<typeof createTRPCContext>;

export { createTRPCContext, type TRPCContext };

const t = initTRPC
	.meta<OpenApiMeta & { edge?: boolean }>()
	.context<TRPCContext>()
	.create({
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

/**
 * 🗺️ ROUTERS & PROCEDURES
 */

const mergeRouters = t.mergeRouters;
const middleware = t.middleware;
const router = t.router;

const publicProcedure = t.procedure;
const publicEdgeProcedure = publicProcedure.meta({
	edge: true,
});

const privateProcedure = t.procedure.use(opts => {
	if (!opts.ctx.user) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: "Can't find that user in our database.",
		});
	}
	return opts.next({
		ctx: {
			user: opts.ctx.user,
		},
	});
});

export {
	middleware,
	mergeRouters,
	privateProcedure,
	publicProcedure,
	publicEdgeProcedure,
	router,
};

/**
 * 🎬 INITIALIZATION
 */

import { inferAsyncReturnType, initTRPC, TRPCError } from '@trpc/server';
import { ipAddress } from '@vercel/edge';
import { Session } from 'next-auth';
import superjson from 'superjson';
import { OpenApiMeta } from 'trpc-openapi';
import { ZodError } from 'zod';

import { ratelimit } from '../../utils/upstash';
import { SessionWorkspace } from '../auth';
/**
 * 🎁 CONTEXT
 */

import { db } from '../db';

interface CreateInnerContextProps {
	session: Session | null;
	user: Session['user'] | null;
	ip: string | undefined;
	workspace?: SessionWorkspace | null;
	pageSessionId?: string | null;
	longitude?: string | number;
	latitude?: string | number;
}

const createInnerTRPCContext = (opts: CreateInnerContextProps) => {
	// console.log('creating inner context');

	const ctx = {
		session: opts.session,
		user: opts.user,
		pageSessionId: opts.pageSessionId,
		workspace: opts.workspace,
		ip: opts.ip,
		db,
		ratelimit,
	};

	return ctx;
};

interface CreateContextProps {
	req: Request;
	auth: Session | null;
	rest?: boolean;
}

const createTRPCContext = async (opts: CreateContextProps) => {
	// console.log('opts => ', opts);

	let session = null;

	if (opts.auth) {
		session = opts.auth;
	} else if (!opts.rest) {
		// console.log('importing next-auth...');
		const { auth } = await import('../auth');
		session = await auth();
	}
	// if (!opts.rest) {

	// 	const { auth } = await import('../auth');
	// 	session = opts.auth ?? (await auth());
	// }

	const longitude = opts.rest
		? undefined
		: opts.req.headers.get('x-longitude') ??
		  opts.req.headers.get('x-vercel-ip-longitude') ??
		  undefined;
	const latitude = opts.rest
		? undefined
		: opts.req.headers.get('x-latitude') ??
		  opts.req.headers.get('x-vercel-ip-latitude') ??
		  undefined;

	const workspaceHandle = opts.rest
		? undefined
		: opts.req.headers.get('x-workspace-handle') ?? null;

	const workspace = workspaceHandle
		? session?.user.workspaces.find(w => w.handle === workspaceHandle)
		: null;

	// console.log('workspaceId ctx => ', workspaceId);

	const pageSessionId = opts.rest
		? undefined
		: opts.req.headers.get('x-page-session-id') ?? null;

	// console.log('pageSessionId ctx => ', pageSessionId);

	// console.log('now we want the ip address');

	const ip = !opts.rest ? ipAddress(opts.req) : '';

	// console.log('ip => ', ip);

	const context = createInnerTRPCContext({
		session: session ?? null,
		user: session?.user ?? null,
		ip,
		workspace,
		pageSessionId,
		longitude,
		latitude,
	});

	// console.log('context => ', context);

	return context;
};

type TRPCContext = inferAsyncReturnType<typeof createTRPCContext>;

export { createTRPCContext, type TRPCContext };

const t = initTRPC
	.meta<OpenApiMeta>()
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

	if (!opts.ctx.workspace) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: "Can't find that workspace in our database.",
		});
	}

	return opts.next({
		ctx: {
			user: opts.ctx.user,
			workspace: opts.ctx.workspace,
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

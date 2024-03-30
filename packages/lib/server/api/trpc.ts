/**
 * 🎬 INITIALIZATION
 */

import type { Session } from 'next-auth';
import type { OpenApiMeta } from 'trpc-openapi';
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { z, ZodError } from 'zod';

import { getUserWorkspaceByHandle } from '../../utils/auth';
import { ratelimit } from '../../utils/upstash';
/**
 * 🎁 CONTEXT
 */

import { db } from '../db';
import { _Users_To_Workspaces } from '../user.sql';

const trpcSources = ['nextjs-react', 'rsc', 'rest'] as const;
type TRPCSource = (typeof trpcSources)[number];

export const createTRPCContext = async (opts: {
	headers: Headers;
	session: Session | null;
	rest?: boolean;
}) => {
	let session: Session | null = null;

	if (opts.session) {
		session = opts.session;
		console.log('auth session => ', session);
	} else if (!opts.rest) {
		const { auth } = await import('../auth');
		session = await auth();
		console.log('ssr session => ', session);
	}

	const source = opts.rest
		? 'rest'
		: trpcSources.includes(opts.headers.get('x-trpc-source') as TRPCSource)
			? (opts.headers.get('x-trpc-source') as TRPCSource)
			: 'unknown';

	console.log('source => ', source);

	const longitude = opts.rest
		? undefined
		: opts.headers.get('x-longitude') ??
			opts.headers.get('x-vercel-ip-longitude') ??
			undefined;
	const latitude = opts.rest
		? undefined
		: opts.headers.get('x-latitude') ??
			opts.headers.get('x-vercel-ip-latitude') ??
			undefined;

	console.log('longitude => ', longitude);
	console.log('latitude => ', latitude);

	const pageSessionId = opts.rest
		? undefined
		: opts.headers.get('x-page-session-id') ?? null;

	console.log('pageSessionId => ', pageSessionId);

	const pusherSocketId = opts.rest
		? undefined
		: opts.headers.get('x-pusher-socket-id') ?? null;

	console.log('pusherSocketId => ', pusherSocketId);

	const workspaceHandle = opts.rest
		? undefined
		: opts.headers.get('x-workspace-handle') ?? null;

	console.log('workspaceHandle => ', workspaceHandle);

	const workspace = workspaceHandle
		? session?.user.workspaces.find(w => w.handle === workspaceHandle)
		: null;

	console.log('workspace => ', workspace);

	const ip = opts.rest ? '' : opts.headers.get('x-real-ip') ?? '';

	console.log('ip => ', ip);

	const context = {
		// auth
		session: opts.session,
		user: opts.session?.user,
		workspace,
		// workspaceHandle,
		pageSessionId,
		pusherSocketId,
		// pii
		ip,
		longitude,
		latitude,
		// for convenience
		db,
		source,
		ratelimit,
	};

	return context;
};

const t = initTRPC
	.meta<OpenApiMeta>()
	.context<typeof createTRPCContext>()
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
 * Create a server-side caller
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 🗺️ ROUTERS & PROCEDURES
 */

export const middleware = t.middleware;
export const createTRPCRouter = t.router;
export const mergeRouters = t.mergeRouters;

export const publicProcedure = t.procedure;

export const privateProcedure = t.procedure.use(async opts => {
	const { ctx } = opts;

	if (!ctx.user) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: "privateProcedure: Can't find that user in our database.",
		});
	}

	if (!ctx.workspace) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: "privateProcedure: Can't find that workspace in our database.",
		});
	}

	return opts.next({
		ctx: {
			user: ctx.user,
			workspace: ctx.workspace,
		},
	});
});

export const workspaceQueryProcedure = privateProcedure.use(async opts => {
	const { ctx } = opts;

	const rawInput = await opts.getRawInput();

	const parsedHandle = z.object({ handle: z.string() }).safeParse(rawInput);

	if (!parsedHandle.success) {
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: 'Invalid handle',
		});
	}

	const workspace = getUserWorkspaceByHandle(ctx.user, parsedHandle.data.handle);

	if (!workspace) {
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: 'Workspace not found',
		});
	}

	return opts.next({
		ctx: {
			...opts.ctx,
			workspace,
		},
	});
});

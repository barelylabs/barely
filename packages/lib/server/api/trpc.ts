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
import { _Users_To_Workspaces } from '../routes/user/user.sql';

const trpcSources = ['nextjs-react', 'rsc', 'rest'] as const;
type TRPCSource = (typeof trpcSources)[number];

export const createTRPCContext = (opts: {
	headers: Headers;
	session: Session | null;
	rest?: boolean;
}) => {
	const session = opts.session;

	const source =
		opts.rest ? 'rest'
		: trpcSources.includes(opts.headers.get('x-trpc-source') as TRPCSource) ?
			(opts.headers.get('x-trpc-source') as TRPCSource)
		:	'unknown';

	const longitude =
		opts.rest ? undefined : (
			opts.headers.get('x-longitude') ??
			opts.headers.get('x-vercel-ip-longitude') ??
			undefined
		);
	const latitude =
		opts.rest ? undefined : (
			opts.headers.get('x-latitude') ??
			opts.headers.get('x-vercel-ip-latitude') ??
			undefined
		);

	const pageSessionId =
		opts.rest ? undefined : opts.headers.get('x-page-session-id') ?? null;

	const pusherSocketId =
		opts.rest ? undefined : opts.headers.get('x-pusher-socket-id') ?? null;

	const workspaceHandle =
		opts.rest ? undefined : opts.headers.get('x-workspace-handle') ?? null;

	const workspace =
		workspaceHandle ?
			session?.user.workspaces.find(w => w.handle === workspaceHandle)
		:	null;

	const ip = opts.rest ? '' : opts.headers.get('x-real-ip') ?? '';

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
	// const { ctx } = opts;

	if (!opts.ctx.user) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: "privateProcedure: Can't find that user in our database.",
		});
	}

	if (!opts.ctx.workspace) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: "privateProcedure: Can't find that workspace in our database.",
		});
	}

	return opts.next({
		ctx: {
			user: opts.ctx.user,
			workspace: opts.ctx.workspace,
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

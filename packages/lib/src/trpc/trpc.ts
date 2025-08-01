/**
 * 🎬 INITIALIZATION
 */

import type { Auth, Session } from '@barely/auth';
import type { NeonPool } from '@barely/db/pool';
import { makePool } from '@barely/db/pool';
import { isDevelopment } from '@barely/utils';
import { initTRPC, TRPCError } from '@trpc/server';
import { waitUntil } from '@vercel/functions';
import superjson from 'superjson';
import { z, ZodError } from 'zod/v4';

import { getSessionWorkspaceByHandle } from '@barely/auth/utils';

import type { VisitorInfo } from '../middleware/request-parsing';

/**
 * 🎁 CONTEXT
 */

const trpcSources = ['nextjs-react', 'rsc', 'rest'] as const;
type TRPCSource = (typeof trpcSources)[number];

export const createTRPCContext = async (opts: {
	auth: Auth | null;
	headers: Headers;
	pool: NeonPool | null;
	visitor?: VisitorInfo;
	rest?: boolean;
	session?: Session;
}) => {
	const source =
		opts.rest ? 'rest'
		: trpcSources.includes(opts.headers.get('x-trpc-source') as TRPCSource) ?
			(opts.headers.get('x-trpc-source') as TRPCSource)
		:	'unknown';

	const session = await opts.auth?.api.getSession({ headers: opts.headers });

	const pageSessionId =
		opts.rest ? undefined : (opts.headers.get('x-page-session-id') ?? null);

	const pusherSocketId =
		opts.rest ? undefined : (opts.headers.get('x-pusher-socket-id') ?? null);

	const getRefreshedSession = async () => {
		// "If you want to disable returning from the cookie cache when fetching the session, you can pass disableCookieCache:true this will force the server to fetch the session from the database and also refresh the cookie cache."
		const session = await opts.auth?.api.getSession({
			headers: opts.headers,
			query: {
				disableCookieCache: true,
			},
		});
		return session;
	};

	const context = {
		auth: opts.auth,
		getRefreshedSession,
		session,
		user: session?.user,
		workspaces: session?.workspaces,
		pageSessionId,
		pusherSocketId,
		visitor: opts.visitor,
		pool: opts.pool,
		source,
	};

	return context;
};

const t = initTRPC.context<typeof createTRPCContext>().create({
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

// let pool: NeonPool | null = null;

const poolMiddleware = middleware(async ({ next, ctx }) => {
	// Note: Currently each procedure in a batch creates its own pool.
	// Future optimization: For httpBatchStreamLink, we could push pool
	// management up to the route handler to share a single pool across
	// all procedures in a batch, closing it only after all responses
	// have been streamed. This would require tracking active operations
	// at the handler level.

	const pool = ctx.pool ?? makePool();

	const res = await next({
		ctx: {
			...ctx,
			pool,
		},
	});

	if (!ctx.pool) waitUntil(pool.end()); // only end the pool if it was created in this request

	return res;
});

/**
 * Middleware for timing procedure execution and adding an articifial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
	const start = Date.now();

	if (t._config.isDev) {
		// artificial delay in dev 100-500ms
		const waitMs = Math.floor(Math.random() * 400) + 100;
		await new Promise(resolve => setTimeout(resolve, waitMs));
	}

	const result = await next();

	const end = Date.now();
	console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

	return result;
});

export const publicProcedure = t.procedure.use(timingMiddleware).use(poolMiddleware);
// export const publicProcedure = t.procedure;

export const privateProcedure = t.procedure
	.use(timingMiddleware)
	.use(poolMiddleware)
	.use(async opts => {
		if (!opts.ctx.session) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: "privateProcedure: Can't find that session in our database.",
			});
		}

		if (!opts.ctx.user) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: "privateProcedure: Can't find that user in our database.",
			});
		}

		if (!opts.ctx.workspaces) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: "privateProcedure: Can't find that user's workspaces in our database.",
			});
		}

		return opts.next({
			ctx: {
				...opts.ctx,
				session: opts.ctx.session,
				user: opts.ctx.user,
				workspaces: opts.ctx.workspaces,
			},
		});
	});

/* I believe this was implemented to differentiate workspace queries between different workspaces
    On the server it's not a problem, because the workspace is well defined, 
    but on the client (once we've moved into an SPA), React Query caches queries
    and needs a way to differentiate between them. Otherwise, when a user switches workspaces, the
    cached query data will still reference the previous workspace.

    The solution is to use the handle as part of the cache key.
*/
export const workspaceProcedure = publicProcedure
	.input(z.object({ handle: z.string() }))
	.use(timingMiddleware)
	.use(poolMiddleware)
	.use(async opts => {
		const { ctx } = opts;
		const rawInput = await opts.getRawInput();

		const parsedHandle = z.object({ handle: z.string() }).safeParse(rawInput);

		if (!parsedHandle.success) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: 'Invalid handle',
			});
		}

		if (!ctx.session) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: "privateProcedure: Can't find that session in our database.",
			});
		}

		if (!ctx.user) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: "privateProcedure: Can't find that user in our database.",
			});
		}

		if (!ctx.workspaces) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: "privateProcedure: Can't find that user's workspaces in our database.",
			});
		}

		try {
			const workspace = getSessionWorkspaceByHandle(
				ctx.session,
				parsedHandle.data.handle,
			);

			if (isDevelopment()) {
				console.log('ws: ', workspace.id);
				console.log('ws: ', workspace.handle);
				console.log('ws: ', workspace.timezone);
			}

			return opts.next({
				ctx: {
					...opts.ctx,
					session: ctx.session,
					user: ctx.user,
					workspaces: ctx.workspaces,
					workspace,
				},
			});
		} catch {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Workspace not found',
			});
		}
	});

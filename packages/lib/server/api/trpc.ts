/**
 * 🎬 INITIALIZATION
 */

import type { Session } from 'next-auth';
import type { OpenApiMeta } from 'trpc-openapi';
import { Pool } from '@neondatabase/serverless';
import { initTRPC, TRPCError } from '@trpc/server';
import { waitUntil } from '@vercel/functions';
import { drizzle } from 'drizzle-orm/neon-serverless';
import superjson from 'superjson';
import { z, ZodError } from 'zod/v4';

import type { VisitorInfo } from '../../utils/middleware';
// import type { DbPool } from '../db/pool';
/**
 * 🎁 CONTEXT
 */

import { env } from '../../env';
import { getUserWorkspaceByHandle } from '../../utils/auth';
// import { DEFAULT_VISITOR_INFO } from '../../utils/middleware';
import { ratelimit } from '../../utils/upstash';
import { dbHttp, dbSchema } from '../db';
import { _Users_To_Workspaces } from '../routes/user/user.sql';

const trpcSources = ['nextjs-react', 'rsc', 'rest'] as const;
type TRPCSource = (typeof trpcSources)[number];

export const createTRPCContext = (opts: {
	headers: Headers;
	visitor?: VisitorInfo;
	// dbPool: DbPool;
	session: Session | null;
	rest?: boolean;
}) => {
	const session = opts.session;

	const source =
		opts.rest ? 'rest'
		: trpcSources.includes(opts.headers.get('x-trpc-source') as TRPCSource) ?
			(opts.headers.get('x-trpc-source') as TRPCSource)
		:	'unknown';

	const pageSessionId =
		opts.rest ? undefined : (opts.headers.get('x-page-session-id') ?? null);

	const pusherSocketId =
		opts.rest ? undefined : (opts.headers.get('x-pusher-socket-id') ?? null);

	const workspaceHandle =
		opts.rest ? undefined : (opts.headers.get('x-workspace-handle') ?? null);

	const workspace =
		workspaceHandle ?
			session?.user.workspaces.find(w => w.handle === workspaceHandle)
		:	null;

	// console.log('opts.visitor', opts.visitor);

	// const visitor = env.VERCEL_ENV === 'development' ? DEFAULT_VISITOR_INFO : {
	//     ip: opts.visitor?.ip ?? opts.headers.get('x-forwarded-for') ?? opts.headers.get('x-vercel-ip') ?? 'Unknown',
	//     geo: {
	//         latitude: opts.visitor?.geo.latitude ?? parseFloat(opts.headers.get('x-vercel-ip-latitude') ?? '0'),
	//         longitude: opts.visitor?.geo.longitude ?? parseFloat(opts.headers.get('x-vercel-ip-longitude') ?? '0'),
	//         city: opts.visitor?.geo.city ?? opts.headers.get('x-vercel-ip-city') ?? 'Unknown',
	//         country: opts.visitor?.geo.country ?? opts.headers.get('x-vercel-ip-country') ?? 'Unknown',
	//         region: opts.visitor?.geo.region ?? opts.headers.get('x-vercel-ip-region') ?? 'Unknown',
	//     },
	//     userAgent: opts.visitor?.userAgent ?? opts.headers.g,
	// };

	// console.log('trpc context visitor >>', opts.visitor);

	const context = {
		// auth
		session: opts.session,
		user: opts.session?.user,
		workspace,
		// workspaceHandle,
		pageSessionId,
		pusherSocketId,
		// pii
		// visitor: env.VERCEL_ENV === 'development' ? DEFAULT_VISITOR_INFO : opts.visitor,
		visitor: opts.visitor,
		// for convenience
		db: {
			http: dbHttp,
			// pool: opts.dbPool,
		},
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

const dbPoolMiddleware = middleware(async ({ next, ctx }) => {
	// console.log('dbPoolMiddleware visitor >>', ctx.visitor); // Add this log

	const pool = new Pool({ connectionString: env.DATABASE_POOL_URL });
	const dbPool = drizzle(pool, {
		schema: dbSchema,
	});

	const res = await next({
		ctx: {
			...ctx,
			db: {
				http: dbHttp,
				pool: dbPool,
			},
		},
	});

	waitUntil(pool.end());

	return res;
});

export const publicProcedure = t.procedure.use(dbPoolMiddleware);

export const privateProcedure = t.procedure.use(dbPoolMiddleware).use(async opts => {
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

/* I believe this was implemented to differentiate workspace queries between different workspaces
    On the server it's not a problem, because the workspace is well defined, 
    but on the client (once we've moved into an SPA), React Query caches queries
    and needs a way to differentiate between them. Otherwise, when a user switches workspaces, the
    cached query data will still reference the previous workspace.

    The solution is to use the handle as part of the cache key.
*/
export const workspaceQueryProcedure = privateProcedure
	.input(z.object({ handle: z.string() }))
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

		try {
			const workspace = getUserWorkspaceByHandle(ctx.user, parsedHandle.data.handle);
			return opts.next({
				ctx: {
					...opts.ctx,
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

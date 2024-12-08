import type { AnyRouter } from '@trpc/server';
// import { Pool } from '@neondatabase/serverless';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

// import { waitUntil } from '@vercel/functions';
// import { drizzle } from 'drizzle-orm/neon-serverless';

// import { env } from '../../env';
// import { parseReqForVisitorInfo } from '../../utils/middleware';
import { setCorsHeaders } from '../../utils/trpc-route';
import { auth } from '../auth';
// import { dbSchema } from '../db';
import { createTRPCContext } from './trpc';

export const routeHandler = (path: string, router: AnyRouter) =>
	auth(async req => {
		// const pool = new Pool({ connectionString: env.DATABASE_POOL_URL });
		// const dbPool = drizzle(pool, {
		// 	schema: dbSchema,
		// });

		const response = await fetchRequestHandler({
			endpoint: '/api/trpc/' + path,
			router,
			req,
			createContext: () =>
				createTRPCContext({
					session: req.auth,
					headers: req.headers,
					// visitor: parseReqForVisitorInfo(req),
					// dbPool,
				}),
			onError({ error, path }) {
				console.error(`>>> tRPC Error on '${path}'`, error);
			},
		}).catch(err => {
			console.error('err => ', err);
			return new Response(null, {
				statusText: 'Internal Server Error',
				status: 500,
			});
		});

		setCorsHeaders(response);

		// waitUntil(pool.end());

		return response;
	});
``;

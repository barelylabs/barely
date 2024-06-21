// import { routeHandler } from '@barely/lib/server/api/route-handler';
import { createTRPCContext } from '@barely/lib/server/api/trpc';
import { auth } from '@barely/lib/server/auth';
import { dbSchema } from '@barely/lib/server/db';
import { workspaceRouter } from '@barely/lib/server/routes/workspace/workspace.router';
import { parseReqForVisitorInfo } from '@barely/lib/utils/middleware';
import { OPTIONS, setCorsHeaders } from '@barely/lib/utils/trpc-route';
import { Pool } from '@neondatabase/serverless';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
// import { waitUntil } from '@vercel/functions';
import { drizzle } from 'drizzle-orm/neon-serverless';

import { env } from '~/env';

// const handler = routeHandler('workspace', workspaceRouter);

const handler = auth(async req => {
	const pool = new Pool({ connectionString: env.DATABASE_POOL_URL });
	const dbPool = drizzle(pool, {
		schema: dbSchema,
	});

	try {
		const response = await fetchRequestHandler({
			endpoint: '/api/trpc/workspace',
			router: workspaceRouter,
			req,
			createContext: () =>
				createTRPCContext({
					session: req.auth,
					headers: req.headers,
					visitor: parseReqForVisitorInfo(req),
					dbPool,
				}),
			onError({ error, path }) {
				console.error(`>>> tRPC Error on '${path}'`, error);
			},
		});

		setCorsHeaders(response);

		return response;
	} catch (error) {
		console.error('err => ', error);
		return new Response(null, {
			statusText: 'Internal Server Error',
			status: 500,
		});
	} finally {
		await pool.end();
	}

	// const response = await fetchRequestHandler({
	// 	endpoint: '/api/trpc/workspace',
	// 	router: workspaceRouter,
	// 	req,
	// 	createContext: () =>
	// 		createTRPCContext({
	// 			session: req.auth,
	// 			headers: req.headers,
	// 			visitor: parseReqForVisitorInfo(req),
	// 			dbPool,
	// 		}),
	// 	onError({ error, path }) {
	// 		console.error(`>>> tRPC Error on '${path}'`, error);
	// 	},
	// }).catch(err => {
	// 	console.error('err => ', err);
	// 	return new Response(null, {
	// 		statusText: 'Internal Server Error',
	// 		status: 500,
	// 	});
	// });

	// setCorsHeaders(response);

	// waitUntil(pool.end());

	// return response;
});

export { OPTIONS, handler as GET, handler as POST };

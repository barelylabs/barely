import type { APPS } from '@barely/const';
import type { AnyRouter } from '@trpc/server';
import type { NextRequest } from 'next/server';
import { makePool } from '@barely/db/pool';
import {
	parseCartReqForHandleAndKey,
	parseFmReqForHandleAndKey,
	parseLandingPageReqForHandleAndKey,
	parseReqForVisitorInfo,
} from '@barely/lib/middleware/request-parsing';
import { createTRPCContext } from '@barely/lib/trpc';
import { log } from '@barely/lib/utils/log';
import { setCorsHeaders } from '@barely/utils';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { waitUntil } from '@vercel/functions';

export const publicRenderHandler =
	({
		app,
		path,
		router,
	}: {
		app: (typeof APPS)[number];
		path: string;
		router: AnyRouter;
	}) =>
	async (req: NextRequest) => {
		const { handle, key } = getHandleAndKey(app, req);

		if (!handle || !key) {
			await log({
				location: `${app}: api/trpc/${path}/[trpc]/route.ts`,
				message: 'missing handle or key in api call',
				type: 'errors',
			});
		}

		const pool = makePool();

		const response = await fetchRequestHandler({
			endpoint: `/api/trpc/${path}`,
			router,
			req,
			createContext: () =>
				createTRPCContext({
					auth: null,
					headers: req.headers,
					visitor: parseReqForVisitorInfo({ req, handle, key }),
					pool,
				}),
			onError({ error, path }) {
				log({
					location: `${app}: api/trpc/${path}/[trpc]/route.ts`,
					message: `tRPC Error on '${path}' :: ${error.message}`,
					type: 'errors',
				}).catch(() => {
					console.error(`>>> tRPC Error on '${path}'`, error);
				});
			},
		}).catch(async err => {
			await log({
				location: `${app}: api/trpc/${path}/[trpc]/route.ts`,
				message: `tRPC error: ${err}`,
				type: 'errors',
			});

			return new Response(null, {
				statusText: 'Internal Server Error',
				status: 500,
			});
		});

		waitUntil(pool.end());

		setCorsHeaders(response);

		return response;
	};

function getHandleAndKey(app: (typeof APPS)[number], req: NextRequest) {
	switch (app) {
		case 'cart':
			return parseCartReqForHandleAndKey(req);
		case 'fm':
			return parseFmReqForHandleAndKey(req);
		case 'page':
			return parseLandingPageReqForHandleAndKey(req);
		default:
			return { handle: null, key: null };
	}
}

import type { NextRequest } from 'next/server';
import { makePool } from '@barely/db/pool';
import {
	parseCartReqForHandleAndKey,
	parseReqForVisitorInfo,
} from '@barely/lib/middleware/request-parsing';
import { createTRPCContext } from '@barely/lib/trpc';
import { log } from '@barely/lib/utils/log';
import { setCorsHeaders } from '@barely/utils';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { waitUntil } from '@vercel/functions';

//
import { cartRouter } from './cart.router';

export const cartHandler = async function (req: NextRequest) {
	const { handle, key } = parseCartReqForHandleAndKey(req);

	if (!handle || !key) {
		await log({
			location: 'cart/api/trpc/cart/[trpc]/route.ts',
			message: 'missing handle or key in api call',
			type: 'errors',
		});
	}

	const pool = makePool();

	const response = await fetchRequestHandler({
		endpoint: '/api/trpc/cart',
		router: cartRouter,
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
				location: 'cart/api/trpc/cart/[trpc]/route.ts',
				message: `tRPC Error on '${path}' :: ${error.message}`,
				type: 'errors',
			}).catch(() => {
				console.error(`>>> tRPC Error on '${path}'`, error);
			});
		},
	}).catch(async err => {
		await log({
			location: 'cart/api/trpc/cart/[trpc]/route.ts',
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

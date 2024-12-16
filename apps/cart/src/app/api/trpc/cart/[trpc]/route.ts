import type { NextRequest } from 'next/server';
import { createTRPCContext } from '@barely/lib/server/api/trpc';
import { cartRouter } from '@barely/lib/server/routes/cart/cart.router';
import { log } from '@barely/lib/utils/log';
import {
	parseCartReqForHandleAndKey,
	parseReqForVisitorInfo,
} from '@barely/lib/utils/middleware';
import { setCorsHeaders } from '@barely/lib/utils/trpc-route';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

export { OPTIONS } from '@barely/lib/utils/trpc-route';

const handler = async function (req: NextRequest) {
	const { handle, key } = parseCartReqForHandleAndKey(req);

	if (!handle || !key) {
		await log({
			location: 'cart/api/trpc/cart/[trpc]/route.ts',
			message: 'missing handle or key in api call',
			type: 'errors',
		});
	}

	const response = await fetchRequestHandler({
		endpoint: '/api/trpc/cart',
		router: cartRouter,
		req,
		createContext: () =>
			createTRPCContext({
				session: null,
				headers: req.headers,
				visitor: parseReqForVisitorInfo({ req, handle, key }),
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

	setCorsHeaders(response);

	return response;
};

export { handler as GET, handler as POST };

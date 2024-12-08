import type { NextRequest } from 'next/server';
import { createTRPCContext } from '@barely/lib/server/api/trpc';
import { cartRouter } from '@barely/lib/server/routes/cart/cart.router';
import { parseCartUrl, parseReqForVisitorInfo } from '@barely/lib/utils/middleware';
import { setCorsHeaders } from '@barely/lib/utils/trpc-route';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

export { OPTIONS } from '@barely/lib/utils/trpc-route';

const handler = async function (req: NextRequest) {
	const { handle, key } = parseCartUrl(req.headers.get('referer') ?? '');

	const visitor = parseReqForVisitorInfo({ req, handle, key });
	console.log('trpc cart visitor >>', visitor);

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

	return response;
};

export { handler as GET, handler as POST };

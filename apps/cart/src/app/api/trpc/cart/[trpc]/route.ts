import { createTRPCContext } from '@barely/lib/server/api/trpc';
import { cartRouter } from '@barely/lib/server/routes/cart/cart.router';
import { setCorsHeaders } from '@barely/lib/utils/trpc-route';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

export const runtime = 'edge';

export { OPTIONS } from '@barely/lib/utils/trpc-route';

const handler = async function (req: Request) {
	const response = await fetchRequestHandler({
		endpoint: '/api/trpc/cart',
		router: cartRouter,
		req,
		createContext: () =>
			createTRPCContext({
				session: null,
				headers: req.headers,
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

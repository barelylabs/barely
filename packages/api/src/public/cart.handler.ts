import { cartRouter } from './cart.router';
import { publicRenderHandler } from './public-render.handler';

// export const cartHandler = async function (req: NextRequest) {
// 	const { handle, key } = parseCartReqForHandleAndKey(req);

// 	if (!handle || !key) {
// 		await log({
// 			location: 'cart/api/trpc/cart/[trpc]/route.ts',
// 			message: 'missing handle or key in api call',
// 			type: 'errors',
// 		});
// 	}

// 	const pool = makePool();

// 	const response = await fetchRequestHandler({
// 		endpoint: '/api/trpc/cart',
// 		router: cartRouter,
// 		req,
// 		createContext: () =>
// 			createTRPCContext({
// 				auth: null,
// 				headers: req.headers,
// 				visitor: parseReqForVisitorInfo({ req, handle, key }),
// 				pool,
// 			}),
// 		onError({ error, path }) {
// 			log({
// 				location: 'cart/api/trpc/cart/[trpc]/route.ts',
// 				message: `tRPC Error on '${path}' :: ${error.message}`,
// 				type: 'errors',
// 			}).catch(() => {
// 				console.error(`>>> tRPC Error on '${path}'`, error);
// 			});
// 		},
// 	}).catch(async err => {
// 		await log({
// 			location: 'cart/api/trpc/cart/[trpc]/route.ts',
// 			message: `tRPC error: ${err}`,
// 			type: 'errors',
// 		});
// 		return new Response(null, {
// 			statusText: 'Internal Server Error',
// 			status: 500,
// 		});
// 	});

// 	waitUntil(pool.end());

// 	setCorsHeaders(response);

// 	return response;
// };

export const cartHandler = publicRenderHandler({
	app: 'cart',
	path: 'cart',
	router: cartRouter,
});

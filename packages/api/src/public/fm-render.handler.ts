import { fmRenderRouter } from './fm-render.router';
import { publicRenderHandler } from './public-render.handler';

// export const fmRenderHandler = async function (req: NextRequest) {
// 	const { handle, key } = parseFmReqForHandleAndKey(req);

// 	if (!handle || !key) {
// 		await log({
// 			location: 'fm: api/trpc/fmPage/[trpc]/route.ts',
// 			message: 'missing handle or key in api call',
// 			type: 'errors',
// 		});
// 	}

// 	const pool = makePool();

// 	const response = await fetchRequestHandler({
// 		endpoint: '/api/trpc/fmPage',
// 		router: fmPageRouter,
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
// 				location: 'fm: api/trpc/fmPage/[trpc]/route.ts',
// 				message: `tRPC Error on '${path}' :: ${error.message}`,
// 				type: 'errors',
// 			}).catch(() => {
// 				console.error(`>>> tRPC Error on '${path}'`, error);
// 			});
// 		},
// 	}).catch(async err => {
// 		await log({
// 			location: 'fm: api/trpc/fmPage/[trpc]/route.ts',
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

export const fmRenderHandler = publicRenderHandler({
	app: 'fm',
	path: 'fmPage',
	router: fmRenderRouter,
});

import { landingPageRenderRouter } from './landing-page-render.router';
import { publicRenderHandler } from './public-render.handler';

// export const landingPageRenderHandler = async function (req: NextRequest) {
// 	const { handle, key } = parseLandingPageReqForHandleAndKey(req);

// 	if (!handle || !key) {
// 		await log({
// 			location: 'landing-page-render/api/trpc/landingPageRender/[trpc]/route.ts',
// 			message: 'missing handle or key in api call',
// 			type: 'errors',
// 		});
// 	}

// 	const pool = makePool();

// 	const response = await fetchRequestHandler({
// 		endpoint: '/api/trpc/landingPageRender',
// 		router: landingPageRenderRouter,
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
// 				location: 'landing-page-render: api/trpc/landingPageRender/[trpc]/route.ts',
// 				message: `tRPC Error on '${path}' :: ${error.message}`,
// 				type: 'errors',
// 			}).catch(() => {
// 				console.error(`>>> tRPC Error on '${path}'`, error);
// 			});
// 		},
// 	}).catch(async err => {
// 		await log({
// 			location: 'landing-page-render: api/trpc/landingPageRender/[trpc]/route.ts',
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

export const landingPageRenderHandler = publicRenderHandler({
	app: 'page',
	path: 'landingPageRender',
	router: landingPageRenderRouter,
});

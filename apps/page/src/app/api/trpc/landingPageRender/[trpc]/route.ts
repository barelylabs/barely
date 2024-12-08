import type { NextRequest } from 'next/server';
import { createTRPCContext } from '@barely/lib/server/api/trpc';
import { landingPageRenderRouter } from '@barely/lib/server/routes/landing-page-render/landing-page-render.router';
import { parsePageUrl, parseReqForVisitorInfo } from '@barely/lib/utils/middleware';
import { setCorsHeaders } from '@barely/lib/utils/trpc-route';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

export { OPTIONS } from '@barely/lib/utils/trpc-route';

const handler = async function (req: NextRequest) {
	const { handle, key } = parsePageUrl(req.headers.get('referer') ?? '');

	const visitor = parseReqForVisitorInfo({ req, handle, key });
	console.log('trpc lp visitor >>', visitor);

	const forwaredFor = req.headers.get('x-forwarded-for');
	console.log('trpc lp forwaredFor >>', forwaredFor);

	const response = await fetchRequestHandler({
		endpoint: '/api/trpc/landingPageRender',
		router: landingPageRenderRouter,
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

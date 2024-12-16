import type { NextRequest } from 'next/server';
import { createTRPCContext } from '@barely/lib/server/api/trpc';
import { fmPageRouter } from '@barely/lib/server/routes/fm-page/fm-page.router';
import { log } from '@barely/lib/utils/log';
import {
	parseFmReqForHandleAndKey,
	parseReqForVisitorInfo,
} from '@barely/lib/utils/middleware';
import { setCorsHeaders } from '@barely/lib/utils/trpc-route';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

export { OPTIONS } from '@barely/lib/utils/trpc-route';

const handler = async function (req: NextRequest) {
	const { handle, key } = parseFmReqForHandleAndKey(req);

	if (!handle || !key) {
		await log({
			location: 'fm/api/trpc/fmPage/[trpc]/route.ts',
			message: 'missing handle or key in api call',
			type: 'errors',
		});
	}

	const response = await fetchRequestHandler({
		endpoint: '/api/trpc/fmPage',
		router: fmPageRouter,
		req,
		createContext: () =>
			createTRPCContext({
				session: null,
				headers: req.headers,
				visitor: parseReqForVisitorInfo({ req, handle, key }),
			}),
		onError({ error, path }) {
			log({
				location: 'fm/api/trpc/fmPage/[trpc]/route.ts',
				message: `tRPC Error on '${path}' :: ${error.message}`,
				type: 'errors',
			}).catch(() => {
				console.error(`>>> tRPC Error on '${path}'`, error);
			});
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

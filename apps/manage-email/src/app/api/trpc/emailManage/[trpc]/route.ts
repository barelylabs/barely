import type { NextRequest } from 'next/server';
import { createTRPCContext } from '@barely/lib/server/api/trpc';
import { emailManageRouter } from '@barely/lib/server/routes/email-manage/email-manage.router';
import { setCorsHeaders } from '@barely/lib/utils/trpc-route';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

export { OPTIONS } from '@barely/lib/utils/trpc-route';

const handler = async function (req: NextRequest) {
	const response = await fetchRequestHandler({
		endpoint: '/api/trpc/emailManage',
		router: emailManageRouter,
		req,
		createContext: () =>
			createTRPCContext({
				session: null,
				headers: req.headers,
				// visitor: parseReqForVisitorInfo(req),
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

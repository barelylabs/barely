import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createTRPCContext } from '@barely/lib/server/api/trpc';
import { fmPageRouter } from '@barely/lib/server/routes/fm-page/fm-page.router';
import { parseFmUrl, parseReqForVisitorInfo } from '@barely/lib/utils/middleware';
import { setCorsHeaders } from '@barely/lib/utils/trpc-route';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

export { OPTIONS } from '@barely/lib/utils/trpc-route';

const handler = async function (req: NextRequest) {
	const { handle, key } = parseFmUrl(req.headers.get('referer') ?? '');

	console.log('trpc fm handle from referrer >>>', handle);
	console.log('trpc fm key from referrer >>>', key);

	const visitor = parseReqForVisitorInfo({ req, handle, key });
	console.log('trpc fm visitor >>', visitor);

	const sessionId = cookies().get('bsid')?.value ?? null;
	console.log('trpc fm sessionId from cookies >>', sessionId);

	const sessionReferer = cookies().get('sessionReferer')?.value ?? null;
	console.log('trpc fm sessionReferer from cookies >>', sessionReferer);

	const sessionRefererUrl = cookies().get('sessionRefererUrl')?.value ?? null;
	console.log('trpc fm sessionRefererUrl from cookies >>', sessionRefererUrl);

	const sessionRefererId = cookies().get('sessionRefererId')?.value ?? null;
	console.log('trpc fm sessionRefererId from cookies >>', sessionRefererId);

	const fbclid = cookies().get('fbclid')?.value ?? null;
	console.log('trpc fm fbclid from cookies >>', fbclid);

	const forwaredFor = req.headers.get('x-forwarded-for');
	console.log('trpc fm forwaredFor >>', forwaredFor);

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

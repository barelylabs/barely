import { headers } from 'next/headers';
import { createTRPCContext } from '@barely/lib/trpc';
import { OPTIONS, setCorsHeaders } from '@barely/utils';
// const handler = async () => {
// 	const preHandlerSession = await getSession();
// 	console.log(
// 		`preHandlerSession in landingPage/[trpc]/route => `,
// 		preHandlerSession?.user.name,
// 	);

// 	return landingPageHandler({ auth: auth });
// };

// const handler = landingPageHandler({ auth: auth });
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

import { landingPageSubRouter } from '@barely/api/app/sub/landing-page.handler';

import { auth } from '~/auth/server';

const handler = async (req: Request) => {
	const session = await auth.api.getSession({ headers: req.headers });
	console.log(`username in api/trpc/landingPage/[trpc]/route => `, session?.user.name);

	const _session = await auth.api.getSession({ headers: await headers() });
	console.log(`_username in api/trpc/landingPage/[trpc]/route => `, _session?.user.name);

	const response = await fetchRequestHandler({
		endpoint: '/api/trpc/landingPage',
		router: landingPageSubRouter,
		req,
		createContext: () =>
			createTRPCContext({
				auth,
				headers: req.headers,
				pool: null, // Let poolMiddleware handle pool creation
				session: session ?? undefined,
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

export { OPTIONS, handler as GET, handler as POST };

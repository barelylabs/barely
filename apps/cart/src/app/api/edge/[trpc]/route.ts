import { setCorsHeaders } from '@barely/lib/utils/cors';
import { edgeRouter } from '@barely/server/api/router.edge';
import { createTRPCContext } from '@barely/server/api/trpc';
import { auth } from '@barely/server/auth';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

export const runtime = 'nodejs';

export function OPTIONS() {
	const response = new Response(null, {
		status: 204,
	});
	setCorsHeaders(response);
	return response;
}

const handler = auth(async req => {
	// console.log("edge api handler :: req.auth", req.auth);

	const response = await fetchRequestHandler({
		endpoint: '/api/edge',
		router: edgeRouter,
		req,
		createContext: () =>
			createTRPCContext({
				session: req.auth,
				headers: req.headers,
			}),
		onError({ error, path }) {
			console.error(`>>> tRPC Error on '${path}'`, error);
		},
	});

	// const clonedResponse = response.clone();
	// clonedResponse
	//   .json()
	//   .then((body) => {
	//     console.log("edge api handler :: response.json()", body);
	//   })
	//   .catch((err) => console.log("err: ", err));

	setCorsHeaders(response);

	// console.log("edge api handler :: response.headers", response.headers);
	return response;
});

export { handler as GET, handler as POST };

import { nodeRouter } from '@barely/server/api/router.node';
import { createTRPCContext } from '@barely/server/api/trpc';
import { auth } from '@barely/server/auth';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

import { setCorsHeaders } from '@barely/utils/cors';

export const runtime = 'nodejs';

export function OPTIONS() {
	const response = new Response(null, {
		status: 204,
	});
	setCorsHeaders(response);
	return response;
}

const handler = auth(async (req): Promise<Response> => {
	const response = await fetchRequestHandler({
		endpoint: '/api/node',
		router: nodeRouter,
		req,
		createContext: () => createTRPCContext({ session: req.auth, headers: req.headers }),
	});

	setCorsHeaders(response);
	return response;
});

export { handler as GET, handler as POST };

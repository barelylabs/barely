import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest } from 'next/server';

import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

import { edgeRouter } from '@barely/api/edge.router';
import { createTRPCContext } from '@barely/api/trpc';

export const config = {
	runtime: 'edge',
};

export default async function edgeHandler(req: NextApiRequest, res: NextApiResponse) {
	return fetchRequestHandler({
		endpoint: '/api/edge',
		router: edgeRouter,
		// 👇 this appears to work, but fetchRequestHandler is looking for NextRequest and createTRPCContext is looking for NextApiRequest.
		req: req as unknown as NextRequest,
		createContext: () => createTRPCContext({ req, res }),
	});
}

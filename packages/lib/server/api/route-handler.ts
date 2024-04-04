import type { AnyRouter } from '@trpc/server';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

import { setCorsHeaders } from '../../utils/trpc-route';
import { auth } from '../auth';
import { createTRPCContext } from './trpc';

export const routeHandler = (path: string, router: AnyRouter) =>
	auth(async req => {
		const response = await fetchRequestHandler({
			endpoint: '/api/trpc/' + path,
			router,
			req,
			createContext: () =>
				createTRPCContext({
					session: req.auth,
					headers: req.headers,
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
	});

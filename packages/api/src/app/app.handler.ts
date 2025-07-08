import type { Auth } from '@barely/auth';
import type { AnyRouter } from '@trpc/server';
import { createTRPCContext } from '@barely/lib/trpc';
import { setCorsHeaders } from '@barely/utils';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

export const routeHandler =
	({ path, router, auth }: { path: string; router: AnyRouter; auth: Auth | null }) =>
	async (req: Request) => {
		console.log('routeHandler called', path);

		const response = await fetchRequestHandler({
			endpoint: '/api/trpc/' + path,
			router,
			req,
			createContext: () =>
				createTRPCContext({
					auth,
					headers: req.headers,
					pool: null, // Let poolMiddleware handle pool creation
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

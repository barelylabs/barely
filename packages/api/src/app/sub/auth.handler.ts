import { createTRPCRouter } from '@barely/lib/trpc';
import { authRoute } from '@barely/lib/trpc/auth.route';

import { auth } from '@barely/auth/app.server';

import { appRouteHandler } from '../app.handler';

const authSubRouter = createTRPCRouter(authRoute);

export const authHandler = appRouteHandler({
	path: 'auth',
	router: authSubRouter,
	auth,
});

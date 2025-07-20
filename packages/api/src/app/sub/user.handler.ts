import { createTRPCRouter } from '@barely/lib/trpc';
import { userRoute } from '@barely/lib/trpc/user.route';

import { auth } from '@barely/auth/app.server';

import { appRouteHandler } from '../app.handler';

const userSubRouter = createTRPCRouter(userRoute);

export const userHandler = appRouteHandler({
	path: 'user',
	router: userSubRouter,
	auth,
});

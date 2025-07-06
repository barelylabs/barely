import { createTRPCRouter } from '@barely/lib/trpc';
import { userRoute } from '@barely/lib/trpc/user.route';

import { auth } from '@barely/auth/app.server';

import { routeHandler } from '../app.handler';

const userSubRouter = createTRPCRouter(userRoute);

export const userHandler = routeHandler({
	path: 'user',
	router: userSubRouter,
	auth,
});

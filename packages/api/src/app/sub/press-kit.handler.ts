import { createTRPCRouter } from '@barely/lib/trpc';
import { pressKitRoute } from '@barely/lib/trpc/press-kit.route';

import { auth } from '@barely/auth/app.server';

import { routeHandler } from '../app.handler';

const pressKitSubRouter = createTRPCRouter(pressKitRoute);

export const pressKitHandler = routeHandler({
	path: 'pressKit',
	router: pressKitSubRouter,
	auth,
});


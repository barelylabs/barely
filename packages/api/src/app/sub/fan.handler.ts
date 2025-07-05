import { createTRPCRouter } from '@barely/lib/trpc';
import { fanRoute } from '@barely/lib/trpc/fan.route';

import { auth } from '@barely/auth/app.server';

import { routeHandler } from '../app.handler';

const fanSubRouter = createTRPCRouter(fanRoute);

export const fanHandler = routeHandler({
	path: 'fan',
	router: fanSubRouter,
	auth,
});


import { createTRPCRouter } from '@barely/lib/trpc';
import { fanGroupRoute } from '@barely/lib/trpc/fan-group.route';

import { auth } from '@barely/auth/app.server';

import { routeHandler } from '../app.handler';

const fanGroupSubRouter = createTRPCRouter(fanGroupRoute);

export const fanGroupHandler = routeHandler({
	path: 'fanGroup',
	router: fanGroupSubRouter,
	auth,
});


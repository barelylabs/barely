import { createTRPCRouter } from '@barely/lib/trpc';
import { fanGroupRoute } from '@barely/lib/trpc/fan-group.route';

import { auth } from '@barely/auth/app.server';

import { appRouteHandler } from '../app.handler';

const fanGroupSubRouter = createTRPCRouter(fanGroupRoute);

export const fanGroupHandler = appRouteHandler({
	path: 'fanGroup',
	router: fanGroupSubRouter,
	auth,
});

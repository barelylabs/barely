import { createTRPCRouter } from '@barely/lib/trpc';
import { statRoute } from '@barely/lib/trpc/stat.route';

import { auth } from '@barely/auth/app.server';

import { routeHandler } from '../app.handler';

const statSubRouter = createTRPCRouter(statRoute);

export const statHandler = routeHandler({
	path: 'stat',
	router: statSubRouter,
	auth,
});


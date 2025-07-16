import { createTRPCRouter } from '@barely/lib/trpc';
import { flowRoute } from '@barely/lib/trpc/flow.route';

import { auth } from '@barely/auth/app.server';

import { appRouteHandler } from '../app.handler';

const flowSubRouter = createTRPCRouter(flowRoute);

export const flowHandler = appRouteHandler({
	path: 'flow',
	router: flowSubRouter,
	auth,
});

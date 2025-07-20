import { createTRPCRouter } from '@barely/lib/trpc';
import { analyticsEndpointRoute } from '@barely/lib/trpc/analytics-endpoint.route';

import { auth } from '@barely/auth/app.server';

import { appRouteHandler } from '../app.handler';

const analyticsEndpointSubRouter = createTRPCRouter(analyticsEndpointRoute);

export const analyticsEndpointHandler = appRouteHandler({
	path: 'analyticsEndpoint',
	router: analyticsEndpointSubRouter,
	auth,
});

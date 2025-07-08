import { createTRPCRouter } from '@barely/lib/trpc';
import { analyticsEndpointRoute } from '@barely/lib/trpc/analytics-endpoint.route';

import { auth } from '@barely/auth/app.server';

import { routeHandler } from '../app.handler';

const analyticsEndpointSubRouter = createTRPCRouter(analyticsEndpointRoute);

export const analyticsEndpointHandler = routeHandler({
	path: 'analyticsEndpoint',
	router: analyticsEndpointSubRouter,
	auth,
});

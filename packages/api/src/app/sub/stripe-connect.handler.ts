import { createTRPCRouter } from '@barely/lib/trpc';
import { stripeConnectRoute } from '@barely/lib/trpc/stripe-connect.route';

import { auth } from '@barely/auth/app.server';

import { routeHandler } from '../app.handler';

const stripeConnectSubRouter = createTRPCRouter(stripeConnectRoute);

export const stripeConnectHandler = routeHandler({
	path: 'stripeConnect',
	router: stripeConnectSubRouter,
	auth,
});


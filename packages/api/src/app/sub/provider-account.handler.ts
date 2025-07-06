import { createTRPCRouter } from '@barely/lib/trpc';
import { providerAccountRoute } from '@barely/lib/trpc/provider-account.route';

import { auth } from '@barely/auth/app.server';

import { routeHandler } from '../app.handler';

const providerAccountSubRouter = createTRPCRouter(providerAccountRoute);

export const providerAccountHandler = routeHandler({
	path: 'providerAccount',
	router: providerAccountSubRouter,
	auth,
});

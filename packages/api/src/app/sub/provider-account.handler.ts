import { createTRPCRouter } from '@barely/lib/trpc';
import { providerAccountRoute } from '@barely/lib/trpc/provider-account.route';

import { auth } from '@barely/auth/app.server';

import { appRouteHandler } from '../app.handler';

const providerAccountSubRouter = createTRPCRouter(providerAccountRoute);

export const providerAccountHandler = appRouteHandler({
	path: 'providerAccount',
	router: providerAccountSubRouter,
	auth,
});

import { createTRPCRouter } from '@barely/lib/trpc';
import { bioRoute } from '@barely/lib/trpc/bio.route';

import { auth } from '@barely/auth/app.server';

import { routeHandler } from '../app.handler';

const bioSubRouter = createTRPCRouter(bioRoute);

export const bioHandler = routeHandler({
	path: 'bio',
	router: bioSubRouter,
	auth,
});


import { createTRPCRouter } from '@barely/lib/trpc';
import { bioRoute } from '@barely/lib/trpc/bio.route';

import { auth } from '@barely/auth/app.server';

import { appRouteHandler } from '../app.handler';

const bioSubRouter = createTRPCRouter(bioRoute);

export const bioHandler = appRouteHandler({
	path: 'bio',
	router: bioSubRouter,
	auth,
});

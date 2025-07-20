import { createTRPCRouter } from '@barely/lib/trpc';
import { mixtapeRoute } from '@barely/lib/trpc/mixtape.route';

import { auth } from '@barely/auth/app.server';

import { appRouteHandler } from '../app.handler';

const mixtapeSubRouter = createTRPCRouter(mixtapeRoute);

export const mixtapeHandler = appRouteHandler({
	path: 'mixtape',
	router: mixtapeSubRouter,
	auth,
});

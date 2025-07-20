import { createTRPCRouter } from '@barely/lib/trpc';
import { trackRoute } from '@barely/lib/trpc/track.route';

import { auth } from '@barely/auth/app.server';

import { appRouteHandler } from '../app.handler';

const trackSubRouter = createTRPCRouter(trackRoute);

export const trackHandler = appRouteHandler({
	path: 'track',
	router: trackSubRouter,
	auth,
});

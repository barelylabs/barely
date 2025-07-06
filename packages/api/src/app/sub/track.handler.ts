import { createTRPCRouter } from '@barely/lib/trpc';
import { trackRoute } from '@barely/lib/trpc/track.route';

import { auth } from '@barely/auth/app.server';

import { routeHandler } from '../app.handler';

const trackSubRouter = createTRPCRouter(trackRoute);

export const trackHandler = routeHandler({
	path: 'track',
	router: trackSubRouter,
	auth,
});

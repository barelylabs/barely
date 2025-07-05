import { createTRPCRouter } from '@barely/lib/trpc';
import { spotifyRoute } from '@barely/lib/trpc/spotify.route';

import { auth } from '@barely/auth/app.server';

import { routeHandler } from '../app.handler';

const spotifySubRouter = createTRPCRouter(spotifyRoute);

export const spotifyHandler = routeHandler({
	path: 'spotify',
	router: spotifySubRouter,
	auth,
});


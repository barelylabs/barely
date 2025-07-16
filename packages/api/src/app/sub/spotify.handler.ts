import { createTRPCRouter } from '@barely/lib/trpc';
import { spotifyRoute } from '@barely/lib/trpc/spotify.route';

import { auth } from '@barely/auth/app.server';

import { appRouteHandler } from '../app.handler';

const spotifySubRouter = createTRPCRouter(spotifyRoute);

export const spotifyHandler = appRouteHandler({
	path: 'spotify',
	router: spotifySubRouter,
	auth,
});

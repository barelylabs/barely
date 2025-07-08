import { createTRPCRouter } from '@barely/lib/trpc';
import { playlistPlacementRoute } from '@barely/lib/trpc/playlist-placement.route';

import { auth } from '@barely/auth/app.server';

import { routeHandler } from '../app.handler';

const playlistPlacementSubRouter = createTRPCRouter(playlistPlacementRoute);

export const playlistPlacementHandler = routeHandler({
	path: 'playlistPlacement',
	router: playlistPlacementSubRouter,
	auth,
});

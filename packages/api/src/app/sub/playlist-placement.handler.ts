import { createTRPCRouter } from '@barely/lib/trpc';
import { playlistPlacementRoute } from '@barely/lib/trpc/playlist-placement.route';

import { auth } from '@barely/auth/app.server';

import { appRouteHandler } from '../app.handler';

const playlistPlacementSubRouter = createTRPCRouter(playlistPlacementRoute);

export const playlistPlacementHandler = appRouteHandler({
	path: 'playlistPlacement',
	router: playlistPlacementSubRouter,
	auth,
});

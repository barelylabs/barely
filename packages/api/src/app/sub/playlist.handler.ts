import { createTRPCRouter } from '@barely/lib/trpc';
import { playlistRoute } from '@barely/lib/trpc/playlist.route';

import { auth } from '@barely/auth/app.server';

import { routeHandler } from '../app.handler';

const playlistSubRouter = createTRPCRouter(playlistRoute);

export const playlistHandler = routeHandler({
	path: 'playlist',
	router: playlistSubRouter,
	auth,
});


import { createTRPCRouter } from '@barely/lib/trpc';
import { playlistRoute } from '@barely/lib/trpc/playlist.route';

import { auth } from '@barely/auth/app.server';

import { appRouteHandler } from '../app.handler';

const playlistSubRouter = createTRPCRouter(playlistRoute);

export const playlistHandler = appRouteHandler({
	path: 'playlist',
	router: playlistSubRouter,
	auth,
});

import { createTRPCRouter } from '@barely/lib/trpc';
import { genreRoute } from '@barely/lib/trpc/genre.route';

import { auth } from '@barely/auth/app.server';

import { appRouteHandler } from '../app.handler';

const genreSubRouter = createTRPCRouter(genreRoute);

export const genreHandler = appRouteHandler({
	path: 'genre',
	router: genreSubRouter,
	auth,
});

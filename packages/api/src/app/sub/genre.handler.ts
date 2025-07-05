import { createTRPCRouter } from '@barely/lib/trpc';
import { genreRoute } from '@barely/lib/trpc/genre.route';

import { auth } from '@barely/auth/app.server';

import { routeHandler } from '../app.handler';

const genreSubRouter = createTRPCRouter(genreRoute);

export const genreHandler = routeHandler({
	path: 'genre',
	router: genreSubRouter,
	auth,
});


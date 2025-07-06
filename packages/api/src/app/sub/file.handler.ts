import { createTRPCRouter } from '@barely/lib/trpc';
import { fileRoute } from '@barely/lib/trpc/file.route';

import { auth } from '@barely/auth/app.server';

import { routeHandler } from '../app.handler';

const fileSubRouter = createTRPCRouter(fileRoute);

export const fileHandler = routeHandler({
	path: 'file',
	router: fileSubRouter,
	auth,
});

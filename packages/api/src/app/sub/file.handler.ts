import { createTRPCRouter } from '@barely/lib/trpc';
import { fileRoute } from '@barely/lib/trpc/file.route';

import { auth } from '@barely/auth/app.server';

import { appRouteHandler } from '../app.handler';

const fileSubRouter = createTRPCRouter(fileRoute);

export const fileHandler = appRouteHandler({
	path: 'file',
	router: fileSubRouter,
	auth,
});

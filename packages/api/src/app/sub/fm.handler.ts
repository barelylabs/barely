import { createTRPCRouter } from '@barely/lib/trpc';
import { fmRoute } from '@barely/lib/trpc/fm.route';

import { auth } from '@barely/auth/app.server';

import { appRouteHandler } from '../app.handler';

const fmSubRouter = createTRPCRouter(fmRoute);

export const fmHandler = appRouteHandler({
	path: 'fm',
	router: fmSubRouter,
	auth,
});

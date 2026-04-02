import { createTRPCRouter } from '@barely/lib/trpc';
import { adminRoute } from '@barely/lib/trpc/admin.route';

import { auth } from '@barely/auth/app.server';

import { appRouteHandler } from '../app.handler';

const adminSubRouter = createTRPCRouter(adminRoute);

export const adminHandler = appRouteHandler({
	path: 'admin',
	router: adminSubRouter,
	auth,
});

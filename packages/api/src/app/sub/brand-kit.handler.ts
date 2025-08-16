import { createTRPCRouter } from '@barely/lib/trpc';
import { brandKitRouter } from '@barely/lib/trpc/routes/brand-kit.route';

import { auth } from '@barely/auth/app.server';

import { appRouteHandler } from '../app.handler';

export const brandKitHandler = appRouteHandler({
	path: 'brandKit',
	router: createTRPCRouter(brandKitRouter),
	auth,
});

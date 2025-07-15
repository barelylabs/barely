import { createTRPCRouter } from '@barely/lib/trpc';
import { linkRoute } from '@barely/lib/trpc/link.route';

import { auth } from '@barely/auth/app.server';

import { appRouteHandler } from '../app.handler';

const linkSubRouter = createTRPCRouter(linkRoute);

export const linkHandler = appRouteHandler({
	path: 'link',
	router: linkSubRouter,
	auth,
});

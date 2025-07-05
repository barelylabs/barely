import { createTRPCRouter } from '@barely/lib/trpc';
import { linkRoute } from '@barely/lib/trpc/link.route';

import { auth } from '@barely/auth/app.server';

import { routeHandler } from '../app.handler';

const linkSubRouter = createTRPCRouter(linkRoute);

export const linkHandler = routeHandler({
	path: 'link',
	router: linkSubRouter,
	auth,
});


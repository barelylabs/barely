import { createTRPCRouter } from '@barely/lib/trpc';
import { visitorSessionRoute } from '@barely/lib/trpc/visitor-session.route';

import { auth } from '@barely/auth/app.server';

import { appRouteHandler } from '../app.handler';

const visitorSessionSubRouter = createTRPCRouter(visitorSessionRoute);

export const visitorSessionHandler = appRouteHandler({
	path: 'visitorSession',
	router: visitorSessionSubRouter,
	auth,
});

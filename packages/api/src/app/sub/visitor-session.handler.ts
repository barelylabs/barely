import { createTRPCRouter } from '@barely/lib/trpc';
import { visitorSessionRoute } from '@barely/lib/trpc/visitor-session.route';

import { auth } from '@barely/auth/app.server';

import { routeHandler } from '../app.handler';

const visitorSessionSubRouter = createTRPCRouter(visitorSessionRoute);

export const visitorSessionHandler = routeHandler({
	path: 'visitorSession',
	router: visitorSessionSubRouter,
	auth,
});


import { createTRPCRouter } from '@barely/lib/trpc';
import { landingPageRoute } from '@barely/lib/trpc/landing-page.route';

import { auth } from '@barely/auth/app.server';

import { appRouteHandler } from '../app.handler';

const landingPageSubRouter = createTRPCRouter(landingPageRoute);

export const landingPageHandler = appRouteHandler({
	path: 'landingPage',
	router: landingPageSubRouter,
	auth,
});

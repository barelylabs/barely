import type { Auth } from '@barely/auth';
import { createTRPCRouter } from '@barely/lib/trpc';
import { landingPageRoute } from '@barely/lib/trpc/landing-page.route';

import { appRouteHandler } from '../app.handler';

export const landingPageSubRouter = createTRPCRouter(landingPageRoute);

export const landingPageHandler = (opts: { auth: Auth }) => {
	return appRouteHandler({
		path: 'landingPage',
		router: landingPageSubRouter,
		auth: opts.auth,
	});
};

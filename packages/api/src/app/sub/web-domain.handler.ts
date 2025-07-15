import { createTRPCRouter } from '@barely/lib/trpc';
import { domainRoute } from '@barely/lib/trpc/domain.route';

import { auth } from '@barely/auth/app.server';

import { appRouteHandler } from '../app.handler';

const webDomainSubRouter = createTRPCRouter(domainRoute);

export const webDomainHandler = appRouteHandler({
	path: 'webDomain',
	router: webDomainSubRouter,
	auth,
});

import { createTRPCRouter } from '@barely/lib/trpc';
import { domainRoute } from '@barely/lib/trpc/domain.route';

import { auth } from '@barely/auth/app.server';

import { routeHandler } from '../app.handler';

const webDomainSubRouter = createTRPCRouter(domainRoute);

export const webDomainHandler = routeHandler({
	path: 'webDomain',
	router: webDomainSubRouter,
	auth,
});

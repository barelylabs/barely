import { createTRPCRouter } from '@barely/lib/trpc';
import { emailDomainRoute } from '@barely/lib/trpc/email-domain.route';

import { auth } from '@barely/auth/app.server';

import { routeHandler } from '../app.handler';

const emailDomainSubRouter = createTRPCRouter(emailDomainRoute);

export const emailDomainHandler = routeHandler({
	path: 'emailDomain',
	router: emailDomainSubRouter,
	auth,
});


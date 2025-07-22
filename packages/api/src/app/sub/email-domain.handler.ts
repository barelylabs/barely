import { createTRPCRouter } from '@barely/lib/trpc';
import { emailDomainRoute } from '@barely/lib/trpc/email-domain.route';

import { auth } from '@barely/auth/app.server';

import { appRouteHandler } from '../app.handler';

const emailDomainSubRouter = createTRPCRouter(emailDomainRoute);

export const emailDomainHandler = appRouteHandler({
	path: 'emailDomain',
	router: emailDomainSubRouter,
	auth,
});

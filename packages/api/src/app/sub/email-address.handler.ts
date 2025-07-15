import { createTRPCRouter } from '@barely/lib/trpc';
import { emailAddressRoute } from '@barely/lib/trpc/email-address.route';

import { auth } from '@barely/auth/app.server';

import { appRouteHandler } from '../app.handler';

const emailAddressSubRouter = createTRPCRouter(emailAddressRoute);

export const emailAddressHandler = appRouteHandler({
	path: 'emailAddress',
	router: emailAddressSubRouter,
	auth,
});

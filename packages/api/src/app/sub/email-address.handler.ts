import { createTRPCRouter } from '@barely/lib/trpc';
import { emailAddressRoute } from '@barely/lib/trpc/email-address.route';

import { auth } from '@barely/auth/app.server';

import { routeHandler } from '../app.handler';

const emailAddressSubRouter = createTRPCRouter(emailAddressRoute);

export const emailAddressHandler = routeHandler({
	path: 'emailAddress',
	router: emailAddressSubRouter,
	auth,
});


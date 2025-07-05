import { createTRPCRouter } from '@barely/lib/trpc';
import { mailchimpRoute } from '@barely/lib/trpc/mailchimp.route';

import { auth } from '@barely/auth/app.server';

import { routeHandler } from '../app.handler';

const mailchimpSubRouter = createTRPCRouter(mailchimpRoute);

export const mailchimpHandler = routeHandler({
	path: 'mailchimp',
	router: mailchimpSubRouter,
	auth,
});


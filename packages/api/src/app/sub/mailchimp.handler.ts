import { createTRPCRouter } from '@barely/lib/trpc';
import { mailchimpRoute } from '@barely/lib/trpc/mailchimp.route';

import { auth } from '@barely/auth/app.server';

import { appRouteHandler } from '../app.handler';

const mailchimpSubRouter = createTRPCRouter(mailchimpRoute);

export const mailchimpHandler = appRouteHandler({
	path: 'mailchimp',
	router: mailchimpSubRouter,
	auth,
});

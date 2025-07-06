import { createTRPCRouter } from '@barely/lib/trpc';
import { emailTemplateRoute } from '@barely/lib/trpc/email-template.route';

import { auth } from '@barely/auth/app.server';

import { routeHandler } from '../app.handler';

const emailTemplateSubRouter = createTRPCRouter(emailTemplateRoute);

export const emailTemplateHandler = routeHandler({
	path: 'emailTemplate',
	router: emailTemplateSubRouter,
	auth,
});

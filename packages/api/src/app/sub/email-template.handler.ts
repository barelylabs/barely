import { createTRPCRouter } from '@barely/lib/trpc';
import { emailTemplateRoute } from '@barely/lib/trpc/email-template.route';

import { auth } from '@barely/auth/app.server';

import { appRouteHandler } from '../app.handler';

const emailTemplateSubRouter = createTRPCRouter(emailTemplateRoute);

export const emailTemplateHandler = appRouteHandler({
	path: 'emailTemplate',
	router: emailTemplateSubRouter,
	auth,
});

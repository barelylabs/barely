import { createTRPCRouter } from '@barely/lib/trpc';
import { emailTemplateGroupRoute } from '@barely/lib/trpc/email-template-group.route';

import { auth } from '@barely/auth/app.server';

import { routeHandler } from '../app.handler';

const emailTemplateGroupSubRouter = createTRPCRouter(emailTemplateGroupRoute);

export const emailTemplateGroupHandler = routeHandler({
	path: 'emailTemplateGroup',
	router: emailTemplateGroupSubRouter,
	auth,
});


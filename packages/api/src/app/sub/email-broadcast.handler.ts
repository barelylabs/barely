import { createTRPCRouter } from '@barely/lib/trpc';
import { emailBroadcastRoute } from '@barely/lib/trpc/email-broadcast.route';

import { auth } from '@barely/auth/app.server';

import { appRouteHandler } from '../app.handler';

const emailBroadcastSubRouter = createTRPCRouter(emailBroadcastRoute);

export const emailBroadcastHandler = appRouteHandler({
	path: 'emailBroadcast',
	router: emailBroadcastSubRouter,
	auth,
});

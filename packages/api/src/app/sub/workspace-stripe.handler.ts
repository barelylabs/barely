import { createTRPCRouter } from '@barely/lib/trpc';
import { workspaceStripeRoute } from '@barely/lib/trpc/workspace-stripe.route';

import { auth } from '@barely/auth/app.server';

import { appRouteHandler } from '../app.handler';

const workspaceStripeSubRouter = createTRPCRouter(workspaceStripeRoute);

export const workspaceStripeHandler = appRouteHandler({
	path: 'workspaceStripe',
	router: workspaceStripeSubRouter,
	auth,
});

import { createTRPCRouter } from '@barely/lib/trpc';
import { campaignRoute } from '@barely/lib/trpc/campaign.route';

import { auth } from '@barely/auth/app.server';

import { appRouteHandler } from '../app.handler';

const campaignSubRouter = createTRPCRouter(campaignRoute);

export const campaignHandler = appRouteHandler({
	path: 'campaign',
	router: campaignSubRouter,
	auth,
});

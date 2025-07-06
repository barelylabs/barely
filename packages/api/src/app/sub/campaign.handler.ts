import { createTRPCRouter } from '@barely/lib/trpc';
import { campaignRoute } from '@barely/lib/trpc/campaign.route';

import { auth } from '@barely/auth/app.server';

import { routeHandler } from '../app.handler';

const campaignSubRouter = createTRPCRouter(campaignRoute);

export const campaignHandler = routeHandler({
	path: 'campaign',
	router: campaignSubRouter,
	auth,
});

import { routeHandler } from '@barely/lib/server/api/route-handler';
import { campaignRouter } from '@barely/lib/server/routes/campaign/campaign.router';

export { OPTIONS } from '@barely/lib/utils/trpc-route';

const handler = routeHandler(campaignRouter);

export { handler as GET, handler as POST };

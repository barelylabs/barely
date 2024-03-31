import { routeHandler } from '@barely/lib/server/api/route-handler';
import { analyticsEndpointRouter } from '@barely/lib/server/routes/analytics-endpoint/analytics-endpoint.router';
import { OPTIONS } from '@barely/lib/utils/trpc-route';

const handler = routeHandler(analyticsEndpointRouter);

export { OPTIONS, handler as GET, handler as POST };

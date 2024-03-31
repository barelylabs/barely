import { routeHandler } from '@barely/lib/server/api/route-handler';
import { trackRouter } from '@barely/lib/server/routes/track/track.router';

export { OPTIONS } from '@barely/lib/utils/trpc-route';

const handler = routeHandler('track', trackRouter);

export { handler as GET, handler as POST };

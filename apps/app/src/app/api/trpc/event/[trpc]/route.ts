import { routeHandler } from '@barely/lib/server/api/route-handler';
import { eventRouter } from '@barely/lib/server/routes/event/event.router';

export { OPTIONS } from '@barely/lib/utils/trpc-route';

const handler = routeHandler('event', eventRouter);

export { handler as GET, handler as POST };

import { routeHandler } from '@barely/lib/server/api/route-handler';
import { mixtapeRouter } from '@barely/lib/server/routes/mixtape/mixtape.router';

export { OPTIONS } from '@barely/lib/utils/trpc-route';

const handler = routeHandler('mixtape', mixtapeRouter);

export { handler as GET, handler as POST };

import { routeHandler } from '@barely/lib/server/api/route-handler';
import { statRouter } from '@barely/lib/server/routes/stat/stat.router';

export { OPTIONS } from '@barely/lib/utils/trpc-route';

const handler = routeHandler(statRouter);

export { handler as GET, handler as POST };

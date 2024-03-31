import { routeHandler } from '@barely/lib/server/api/route-handler';
import { linkRouter } from '@barely/lib/server/routes/link/link.router';

export { OPTIONS } from '@barely/lib/utils/trpc-route';

const handler = routeHandler(linkRouter);

export { handler as GET, handler as POST };

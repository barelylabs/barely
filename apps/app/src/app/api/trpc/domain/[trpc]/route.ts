import { routeHandler } from '@barely/lib/server/api/route-handler';
import { domainRouter } from '@barely/lib/server/routes/domain/domain.router';

export { OPTIONS } from '@barely/lib/utils/trpc-route';

const handler = routeHandler(domainRouter);

export { handler as GET, handler as POST };

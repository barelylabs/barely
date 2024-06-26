import { routeHandler } from '@barely/lib/server/api/route-handler';
import { fmRouter } from '@barely/lib/server/routes/fm/fm.router';

export { OPTIONS } from '@barely/lib/utils/trpc-route';

const handler = routeHandler('fm', fmRouter);

export { handler as GET, handler as POST };

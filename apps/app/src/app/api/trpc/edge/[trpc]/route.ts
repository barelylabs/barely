import { routeHandler } from '@barely/lib/server/api/route-handler';
import { appRouter } from '@barely/lib/server/api/router';

// export const runtime = 'edge';

export { OPTIONS } from '@barely/lib/utils/trpc-route';

const handler = routeHandler('edge', appRouter);

export { handler as GET, handler as POST };

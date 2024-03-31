import { routeHandler } from '@barely/lib/server/api/route-handler';
import { bioRouter } from '@barely/lib/server/routes/bio/bio.router';
import { OPTIONS } from '@barely/lib/utils/trpc-route';

const handler = routeHandler('bio', bioRouter);

export const runtime = 'edge';

export { OPTIONS, handler as GET, handler as POST };

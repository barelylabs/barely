import { routeHandler } from '@barely/lib/server/api/route-handler';
import { pressKitRouter } from '@barely/lib/server/routes/press-kit/press-kit.router';

export { OPTIONS } from '@barely/lib/utils/trpc-route';

const handler = routeHandler('pressKit', pressKitRouter);

export { handler as GET, handler as POST };

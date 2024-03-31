import { routeHandler } from '@barely/lib/server/api/route-handler';
import { stripeConnectRouter } from '@barely/lib/server/routes/stripe-connect/stripe-connect.router';

export { OPTIONS } from '@barely/lib/utils/trpc-route';

const handler = routeHandler(stripeConnectRouter);

export { handler as GET, handler as POST };

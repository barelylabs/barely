import { routeHandler } from '@barely/lib/server/api/route-handler';
import { cartFunnelRouter } from '@barely/lib/server/routes/cart-funnel/cart-funnel.router';

export { OPTIONS } from '@barely/lib/utils/trpc-route';

const handler = routeHandler(cartFunnelRouter);

export { handler as GET, handler as POST };

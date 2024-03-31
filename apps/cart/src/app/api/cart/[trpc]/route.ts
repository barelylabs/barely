import { routeHandler } from '@barely/lib/server/api/route-handler';
import { cartRouter } from '@barely/lib/server/routes/cart/cart.router';

export const runtime = 'edge';

export { OPTIONS } from '@barely/lib/utils/trpc-route';

const handler = routeHandler(cartRouter);

export { handler as GET, handler as POST };

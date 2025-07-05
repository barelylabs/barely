import { createTRPCRouter } from '@barely/lib/trpc';
import { cartFunnelRoute } from '@barely/lib/trpc/cart-funnel.route';

import { auth } from '@barely/auth/app.server';

import { routeHandler } from '../app.handler';

const cartFunnelSubRouter = createTRPCRouter(cartFunnelRoute);

export const cartFunnelHandler = routeHandler({
	path: 'cartFunnel',
	router: cartFunnelSubRouter,
	auth,
});


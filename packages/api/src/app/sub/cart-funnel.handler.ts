import { createTRPCRouter } from '@barely/lib/trpc';
import { cartFunnelRoute } from '@barely/lib/trpc/cart-funnel.route';

import { auth } from '@barely/auth/app.server';

import { appRouteHandler } from '../app.handler';

const cartFunnelSubRouter = createTRPCRouter(cartFunnelRoute);

export const cartFunnelHandler = appRouteHandler({
	path: 'cartFunnel',
	router: cartFunnelSubRouter,
	auth,
});

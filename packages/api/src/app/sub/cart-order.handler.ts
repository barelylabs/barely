import { createTRPCRouter } from '@barely/lib/trpc';
import { cartOrderRoute } from '@barely/lib/trpc/cart-order.route';

import { auth } from '@barely/auth/app.server';

import { appRouteHandler } from '../app.handler';

const cartOrderSubRouter = createTRPCRouter(cartOrderRoute);

export const cartOrderHandler = appRouteHandler({
	path: 'cartOrder',
	router: cartOrderSubRouter,
	auth,
});

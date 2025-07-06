import { createTRPCRouter } from '@barely/lib/trpc';
import { cartOrderRoute } from '@barely/lib/trpc/cart-order.route';

import { auth } from '@barely/auth/app.server';

import { routeHandler } from '../app.handler';

const cartOrderSubRouter = createTRPCRouter(cartOrderRoute);

export const cartOrderHandler = routeHandler({
	path: 'cartOrder',
	router: cartOrderSubRouter,
	auth,
});

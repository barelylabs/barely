import { createTRPCRouter } from '@barely/lib/trpc';
import { productRoute } from '@barely/lib/trpc/product.route';

import { auth } from '@barely/auth/app.server';

import { routeHandler } from '../app.handler';

const productSubRouter = createTRPCRouter(productRoute);

export const productHandler = routeHandler({
	path: 'product',
	router: productSubRouter,
	auth,
});


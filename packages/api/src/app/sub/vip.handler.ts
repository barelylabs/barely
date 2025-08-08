import { createTRPCRouter } from '@barely/lib/trpc';
import { vipSwapRoute } from '@barely/lib/trpc/vip-swap.route';

import { auth } from '@barely/auth/app.server';

import { appRouteHandler } from '../app.handler';

export const vipHandler = appRouteHandler({
	path: 'vipSwap',
	router: createTRPCRouter(vipSwapRoute),
	auth,
});

import { createTRPCRouter } from '@barely/lib/trpc';
import { invoiceClientRoute } from '@barely/lib/trpc/routes/invoice-client.route';

import { auth } from '@barely/auth/app.server';

import { appRouteHandler } from '../app.handler';

const invoiceClientSubRouter = createTRPCRouter(invoiceClientRoute);

export const invoiceClientHandler = appRouteHandler({
	path: 'invoiceClient',
	router: invoiceClientSubRouter,
	auth,
});

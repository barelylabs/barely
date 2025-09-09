import { createTRPCRouter } from '@barely/lib/trpc';
import { invoiceRoute } from '@barely/lib/trpc/routes/invoice.route';

import { auth } from '@barely/auth/app.server';

import { appRouteHandler } from '../app.handler';

const invoiceSubRouter = createTRPCRouter(invoiceRoute);

export const invoiceHandler = appRouteHandler({
	path: 'invoice',
	router: invoiceSubRouter,
	auth,
});

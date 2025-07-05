import { createTRPCRouter } from '@barely/lib/trpc';
import { formResponseRoute } from '@barely/lib/trpc/form-response.route';

import { auth } from '@barely/auth/app.server';

import { routeHandler } from '../app.handler';

const formResponseSubRouter = createTRPCRouter(formResponseRoute);

export const formResponseHandler = routeHandler({
	path: 'formResponse',
	router: formResponseSubRouter,
	auth,
});


import { OPTIONS } from '@barely/utils';

import { appRouteHandler } from '@barely/api/app/app.handler';
import { appRouter } from '@barely/api/app/app.router';

import { auth } from '@barely/auth/app.server';

const appHandler = appRouteHandler({
	path: '_app',
	router: appRouter,
	auth,
});

export { OPTIONS, appHandler as GET, appHandler as POST };

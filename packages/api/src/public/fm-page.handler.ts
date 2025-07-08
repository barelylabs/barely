import { auth } from '@barely/auth/app.server';

import { routeHandler } from '../app/app.handler';
import { fmPageRouter } from './fm-page.router';

export const fmPageHandler = routeHandler({
	path: 'fmPage',
	router: fmPageRouter,
	auth,
});

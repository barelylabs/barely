import { auth } from '@barely/auth/app.server';

import { routeHandler } from '../app/app.handler';
import { emailManageRouter } from './email-manage.router';

export const emailManageHandler = routeHandler({
	path: 'emailManage',
	router: emailManageRouter,
	auth,
});

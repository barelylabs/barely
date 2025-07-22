import { auth } from '@barely/auth/app.server';

import { appRouteHandler } from '../app/app.handler';
import { emailManageRouter } from './email-manage.router';

export const emailManageHandler = appRouteHandler({
	path: 'emailManage',
	router: emailManageRouter,
	auth,
});

import { auth } from '@barely/auth/app.server';

import { routeHandler } from '../app/app.handler';
import { landingPageRenderRouter } from './landing-page-render.router';

export const landingPageRenderHandler = routeHandler({
	path: 'landingPageRender',
	router: landingPageRenderRouter,
	auth,
});

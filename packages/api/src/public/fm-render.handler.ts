import { fmRenderRouter } from './fm-render.router';
import { publicRenderHandler } from './public-render.handler';

export const fmRenderHandler = publicRenderHandler({
	app: 'fm',
	path: 'fmRender',
	router: fmRenderRouter,
});

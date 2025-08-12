import { bioRenderRouter } from './bio-render.router';
import { publicRenderHandler } from './public-render.handler';

export const bioRenderHandler = publicRenderHandler({
	app: 'bio',
	path: 'bioRender',
	router: bioRenderRouter,
});

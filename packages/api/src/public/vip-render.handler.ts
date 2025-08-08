import { publicRenderHandler } from './public-render.handler';
import { vipRenderRouter } from './vip-render.router';

export const vipRenderHandler = publicRenderHandler({
	app: 'vip',
	path: 'vipRender',
	router: vipRenderRouter,
});

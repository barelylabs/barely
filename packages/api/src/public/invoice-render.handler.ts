import { invoiceRenderRouter } from './invoice-render.router';
import { publicRenderHandler } from './public-render.handler';

export const invoiceRenderHandler = publicRenderHandler({
	app: 'invoice',
	path: 'invoiceRender',
	router: invoiceRenderRouter,
});

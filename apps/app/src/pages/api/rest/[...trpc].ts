import { createOpenApiNextHandler } from 'trpc-openapi';

import { createTRPCContext, nodeRouter } from '@barely/lib/api';

export const config = {
	runtime: 'nodejs',
};

export default createOpenApiNextHandler({
	router: nodeRouter,
	createContext: createTRPCContext,
});

import { createTRPCContext } from '@barely/server/api/trpc';
import { createOpenApiNextHandler } from 'trpc-openapi';

import { edgeRouter } from '@barely/api/router.edge';

export const config = {
	runtime: 'nodejs',
};

export default createOpenApiNextHandler({
	router: edgeRouter,
	createContext: ({ req }) => {
		console.log('creating context for rest api');
		return createTRPCContext({
			session: null,
			rest: true,
			headers: req.headers as unknown as Headers,
		});
	},
});

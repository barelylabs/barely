import { createNextApiHandler } from '@trpc/server/adapters/next';

import { createTRPCContext, nodeRouter } from '@barely/lib/api';

export const config = {
	runtime: 'nodejs',
};

export default createNextApiHandler({
	router: nodeRouter,
	createContext: createTRPCContext,
});

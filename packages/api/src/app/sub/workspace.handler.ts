import { createTRPCRouter } from '@barely/lib/trpc';
import { workspaceRoute } from '@barely/lib/trpc/workspace.route';

import { auth } from '@barely/auth/app.server';

import { routeHandler } from '../app.handler';

const workspaceSubRouter = createTRPCRouter(workspaceRoute);

export const workspaceHandler = routeHandler({
	path: 'workspace',
	router: workspaceSubRouter,
	auth,
});


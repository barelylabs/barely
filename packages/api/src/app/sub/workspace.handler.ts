import { createTRPCRouter } from '@barely/lib/trpc';
import { workspaceRoute } from '@barely/lib/trpc/workspace.route';

import { auth } from '@barely/auth/app.server';

import { appRouteHandler } from '../app.handler';

const workspaceSubRouter = createTRPCRouter(workspaceRoute);

export const workspaceHandler = appRouteHandler({
	path: 'workspace',
	router: workspaceSubRouter,
	auth,
});

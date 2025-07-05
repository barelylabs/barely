import { createTRPCRouter } from '@barely/lib/trpc';
import { workspaceInviteRoute } from '@barely/lib/trpc/workspace-invite.route';

import { auth } from '@barely/auth/app.server';

import { routeHandler } from '../app.handler';

const workspaceInviteSubRouter = createTRPCRouter(workspaceInviteRoute);

export const workspaceInviteHandler = routeHandler({
	path: 'workspaceInvite',
	router: workspaceInviteSubRouter,
	auth,
});


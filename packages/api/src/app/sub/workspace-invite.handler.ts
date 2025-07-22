import { createTRPCRouter } from '@barely/lib/trpc';
import { workspaceInviteRoute } from '@barely/lib/trpc/workspace-invite.route';

import { auth } from '@barely/auth/app.server';

import { appRouteHandler } from '../app.handler';

const workspaceInviteSubRouter = createTRPCRouter(workspaceInviteRoute);

export const workspaceInviteHandler = appRouteHandler({
	path: 'workspaceInvite',
	router: workspaceInviteSubRouter,
	auth,
});

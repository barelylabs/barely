import { routeHandler } from '@barely/lib/server/api/route-handler';
import { workspaceInviteRouter } from '@barely/lib/server/routes/workspace-invite/workspace-invite.router';
import { OPTIONS } from '@barely/lib/utils/trpc-route';

export const runtime = 'edge';
const handler = routeHandler(workspaceInviteRouter);

export { OPTIONS, handler as GET, handler as POST };

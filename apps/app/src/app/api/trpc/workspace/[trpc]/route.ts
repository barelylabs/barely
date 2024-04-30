import { routeHandler } from '@barely/lib/server/api/route-handler';
import { workspaceRouter } from '@barely/lib/server/routes/workspace/workspace.router';
import { OPTIONS } from '@barely/lib/utils/trpc-route';

// export const runtime = 'edge';

const handler = routeHandler('workspace', workspaceRouter);

export { OPTIONS, handler as GET, handler as POST };

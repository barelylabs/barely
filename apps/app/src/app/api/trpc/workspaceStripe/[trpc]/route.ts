import { routeHandler } from '@barely/lib/server/api/route-handler';
import { workspaceStripeRouter } from '@barely/lib/server/routes/workspace-stripe/workspace-stripe.router';
import { OPTIONS } from '@barely/lib/utils/trpc-route';

// export const runtime = 'edge';

const handler = routeHandler('workspaceStripe', workspaceStripeRouter);

export { OPTIONS, handler as GET, handler as POST };

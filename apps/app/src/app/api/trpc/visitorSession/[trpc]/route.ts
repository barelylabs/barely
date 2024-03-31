import { routeHandler } from '@barely/lib/server/api/route-handler';
import { visitorSessionRouter } from '@barely/lib/server/routes/visitor-session/visitor-session.router';

export { OPTIONS } from '@barely/lib/utils/trpc-route';

const handler = routeHandler('visitorSession', visitorSessionRouter);

export { handler as GET, handler as POST };

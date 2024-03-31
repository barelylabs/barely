import { routeHandler } from '@barely/lib/server/api/route-handler';
import { fileRouter } from '@barely/lib/server/routes/file/file.router';

export { OPTIONS } from '@barely/lib/utils/trpc-route';

const handler = routeHandler(fileRouter);

export { handler as GET, handler as POST };

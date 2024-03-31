import { routeHandler } from '@barely/lib/server/api/route-handler';
import { userRouter } from '@barely/lib/server/routes/user/user.router';

export { OPTIONS } from '@barely/lib/utils/trpc-route';

const handler = routeHandler('user', userRouter);

export { handler as GET, handler as POST };

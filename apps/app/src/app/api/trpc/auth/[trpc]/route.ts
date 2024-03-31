import { routeHandler } from '@barely/lib/server/api/route-handler';
import { authRouter } from '@barely/lib/server/routes/auth/auth.router';
import { OPTIONS } from '@barely/lib/utils/trpc-route';

const handler = routeHandler('auth', authRouter);

export { OPTIONS, handler as GET, handler as POST };

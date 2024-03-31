import { routeHandler } from '@barely/lib/server/api/route-handler';
import { providerAccountRouter } from '@barely/lib/server/routes/provider-account/provider-account.router';

export { OPTIONS } from '@barely/lib/utils/trpc-route';

const handler = routeHandler('providerAccount', providerAccountRouter);

export { handler as GET, handler as POST };

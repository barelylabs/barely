import { routeHandler } from '@barely/lib/server/api/route-handler';
import { formResponseRouter } from '@barely/lib/server/routes/form/form-response.router';

export { OPTIONS } from '@barely/lib/utils/trpc-route';

const handler = routeHandler('formResponse', formResponseRouter);

export { handler as GET, handler as POST };

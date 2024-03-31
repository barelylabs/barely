import { routeHandler } from '@barely/lib/server/api/route-handler';
import { productRouter } from '@barely/lib/server/routes/product/product.router';

export { OPTIONS } from '@barely/lib/utils/trpc-route';

const handler = routeHandler(productRouter);

export { handler as GET, handler as POST };

import { routeHandler } from '@barely/lib/server/api/route-handler';
import { genreRouter } from '@barely/lib/server/routes/genre/genre.router';

export { OPTIONS } from '@barely/lib/utils/trpc-route';

const handler = routeHandler('genre', genreRouter);

export { handler as GET, handler as POST };

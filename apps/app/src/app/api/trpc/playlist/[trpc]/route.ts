import { routeHandler } from '@barely/lib/server/api/route-handler';
import { playlistRouter } from '@barely/lib/server/routes/playlist/playlist.router';

export { OPTIONS } from '@barely/lib/utils/trpc-route';

const handler = routeHandler('playlist', playlistRouter);

export { handler as GET, handler as POST };

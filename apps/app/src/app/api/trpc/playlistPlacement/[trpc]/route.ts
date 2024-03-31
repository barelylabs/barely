import { routeHandler } from '@barely/lib/server/api/route-handler';
import { playlistPlacementRouter } from '@barely/lib/server/routes/playlist-placement/playlist-placement.router';

export { OPTIONS } from '@barely/lib/utils/trpc-route';

const handler = routeHandler('playlistPlacement', playlistPlacementRouter);

export { handler as GET, handler as POST };

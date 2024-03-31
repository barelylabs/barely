import { routeHandler } from '@barely/lib/server/api/route-handler';
import { spotifyRouter } from '@barely/lib/server/routes/spotify/spotify.router';

export { OPTIONS } from '@barely/lib/utils/trpc-route';

const handler = routeHandler('spotify', spotifyRouter);

export { handler as GET, handler as POST };

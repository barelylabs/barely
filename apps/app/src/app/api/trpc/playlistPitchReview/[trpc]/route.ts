import { routeHandler } from '@barely/lib/server/api/route-handler';
import { playlistPitchReviewRouter } from '@barely/lib/server/routes/playlist-pitch-review/playlist-pitch-review.router';

export { OPTIONS } from '@barely/lib/utils/trpc-route';

const handler = routeHandler('playlistPitchReview', playlistPitchReviewRouter);

export { handler as GET, handler as POST };

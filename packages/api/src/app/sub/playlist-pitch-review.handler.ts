import { createTRPCRouter } from '@barely/lib/trpc';
import { playlistPitchReviewRoute } from '@barely/lib/trpc/playlist-pitch-review.route';

import { auth } from '@barely/auth/app.server';

import { routeHandler } from '../app.handler';

const playlistPitchReviewSubRouter = createTRPCRouter(playlistPitchReviewRoute);

export const playlistPitchReviewHandler = routeHandler({
	path: 'playlistPitchReview',
	router: playlistPitchReviewSubRouter,
	auth,
});


// import { playlistPlacementRouter } from './playlist-placement/playlist-placement.edge.router';
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

import { spotifyRouter } from './spotify/spotify.edge.router';
import { router } from './trpc';
import { userRouter } from './user/user.edge.router';

const edgeRouter = router({
	user: userRouter,
	// playlistPlacement: playlistPlacementRouter,
	spotify: spotifyRouter,
});

type EdgeRouter = typeof edgeRouter;
type EdgeRouterInputs = inferRouterInputs<EdgeRouter>;
type EdgeRouterOutputs = inferRouterOutputs<EdgeRouter>;

export { edgeRouter, type EdgeRouter, type EdgeRouterInputs, type EdgeRouterOutputs };

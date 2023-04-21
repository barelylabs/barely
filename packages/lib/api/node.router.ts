import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

import { accountRouter } from './account/account.node.router';
import { authRouter } from './auth/auth.node.router';
import { bioRouter } from './bio/bio.node.router';
import { campaignRouter } from './campaign/campaign.node.router';
import { eventRouter } from './event/event.node.router';
import { formResponseRouter } from './form-response/form-response.node.router';
import { genreRouter } from './genre/genre.node.router';
import { linkRouter } from './link/link.node.router';
import { playlistPitchReviewRouter } from './playlist-pitch-review/playlist-pitch-review.node.router';
import { playlistPlacementRouter } from './playlist-placement/playlist-placement.node.router';
import { playlistRouter } from './playlist/playlist.node.router';
import { spotifyRouter } from './spotify/spotify.node.router';
import {
	storyBoardRouter,
	storyColumnRouter,
	storyRouter,
} from './story/story.node.router';
import { teamRouter } from './team/team.node.router';
import { trackRouter } from './track/track.node.router';
import { router } from './trpc';
import { userRouter } from './user/user.node.router';
import { visitorSessionRouter } from './visitor-session/visitor-session.node.router';

// export routes
const nodeRouter = router({
	account: accountRouter,
	auth: authRouter,
	bio: bioRouter,
	campaign: campaignRouter,
	event: eventRouter,
	formResponse: formResponseRouter,
	genre: genreRouter,
	link: linkRouter,
	playlist: playlistRouter,
	playlistPitchReview: playlistPitchReviewRouter,
	playlistPlacement: playlistPlacementRouter,
	spotify: spotifyRouter,
	story: storyRouter,
	storyBoard: storyBoardRouter,
	storyColumn: storyColumnRouter,
	track: trackRouter,
	team: teamRouter,
	user: userRouter,
	visitorSession: visitorSessionRouter,
});

// const appCaller = appRouter.createCaller({

// })

// export type definition of API
type NodeRouter = typeof nodeRouter;
type NodeRouterInputs = inferRouterInputs<NodeRouter>;
type NodeRouterOutputs = inferRouterOutputs<NodeRouter>;

export { nodeRouter, type NodeRouter, type NodeRouterInputs, type NodeRouterOutputs };

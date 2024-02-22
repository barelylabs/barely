import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import { analyticsEndpointRouter } from "../analytics-endpoint.router";
import { authRouter } from "../auth/auth.router";
import { bioRouter } from "../bio.router";
import { campaignRouter } from "../campaign.router";
import { domainRouter } from "../domain.router";
import { eventRouter } from "../event.router";
import { formResponseRouter } from "../form-response.router";
import { genreRouter } from "../genre.router";
import { linkRouter } from "../link.router";
import { playlistPitchReviewRouter } from "../playlist-pitch-review.router";
import { playlistPlacementRouter } from "../playlist-placement.router";
import { playlistRouter } from "../playlist.router";
import { providerAccountRouter } from "../provider-account.router";
import { spotifyRouter } from "../spotify.router";
import { statRouter } from "../stat.router";
import { trackRouter } from "../track.router";
import { userRouter } from "../user.router";
import { visitorSessionRouter } from "../visitor-session.router";
import { workspaceRouter } from "../workspace.router";
import { createTRPCRouter } from "./trpc";

const edgeRouter = createTRPCRouter({
  analyticsEndpoint: analyticsEndpointRouter,
  auth: authRouter,
  bio: bioRouter,
  campaign: campaignRouter,
  domain: domainRouter,
  event: eventRouter,
  formResponse: formResponseRouter,
  genre: genreRouter,
  link: linkRouter,
  playlist: playlistRouter,
  playlistPitchReview: playlistPitchReviewRouter,
  playlistPlacement: playlistPlacementRouter,
  providerAccount: providerAccountRouter,
  spotify: spotifyRouter,
  stat: statRouter,
  workspace: workspaceRouter,
  track: trackRouter,
  user: userRouter,
  visitorSession: visitorSessionRouter,
});

type EdgeRouter = typeof edgeRouter;
type EdgeRouterInputs = inferRouterInputs<EdgeRouter>;
type EdgeRouterOutputs = inferRouterOutputs<EdgeRouter>;

export {
  edgeRouter,
  type EdgeRouter,
  type EdgeRouterInputs,
  type EdgeRouterOutputs,
};

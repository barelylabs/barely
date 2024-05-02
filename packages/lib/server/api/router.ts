import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

import { analyticsEndpointRouter } from '../routes/analytics-endpoint/analytics-endpoint.router';
import { authRouter } from '../routes/auth/auth.router';
import { bioRouter } from '../routes/bio/bio.router';
import { campaignRouter } from '../routes/campaign/campaign.router';
import { cartFunnelRouter } from '../routes/cart-funnel/cart-funnel.router';
import { cartOrderRouter } from '../routes/cart-order/cart-order.router';
import { cartRouter } from '../routes/cart/cart.router';
import { domainRouter } from '../routes/domain/domain.router';
import { eventRouter } from '../routes/event/event.router';
import { fileRouter } from '../routes/file/file.router';
import { formResponseRouter } from '../routes/form/form-response.router';
import { genreRouter } from '../routes/genre/genre.router';
import { linkRouter } from '../routes/link/link.router';
import { mailchimpRouter } from '../routes/mailchimp/mailchimp.router';
import { mixtapeRouter } from '../routes/mixtape/mixtape.router';
import { playlistPitchReviewRouter } from '../routes/playlist-pitch-review/playlist-pitch-review.router';
import { playlistPlacementRouter } from '../routes/playlist-placement/playlist-placement.router';
import { playlistRouter } from '../routes/playlist/playlist.router';
import { pressKitRouter } from '../routes/press-kit/press-kit.router';
import { productRouter } from '../routes/product/product.router';
import { providerAccountRouter } from '../routes/provider-account/provider-account.router';
import { spotifyRouter } from '../routes/spotify/spotify.router';
import { statRouter } from '../routes/stat/stat.router';
import { stripeConnectRouter } from '../routes/stripe-connect/stripe-connect.router';
import { trackRouter } from '../routes/track/track.router';
import { userRouter } from '../routes/user/user.router';
import { visitorSessionRouter } from '../routes/visitor-session/visitor-session.router';
import { workflowRouter } from '../routes/workflow/workflow.router';
import { workspaceInviteRouter } from '../routes/workspace-invite/workspace-invite.router';
import { workspaceStripeRouter } from '../routes/workspace-stripe/workspace-stripe.router';
import { workspaceRouter } from '../routes/workspace/workspace.router';
import { createTRPCRouter } from './trpc';

const appRouter = createTRPCRouter({
	analyticsEndpoint: analyticsEndpointRouter,
	auth: authRouter,
	bio: bioRouter,
	campaign: campaignRouter,
	cart: cartRouter,
	cartFunnel: cartFunnelRouter,
	cartOrder: cartOrderRouter,
	domain: domainRouter,
	event: eventRouter,
	file: fileRouter,
	formResponse: formResponseRouter,
	genre: genreRouter,
	link: linkRouter,
	mixtape: mixtapeRouter,
	mailchimp: mailchimpRouter,
	playlist: playlistRouter,
	playlistPitchReview: playlistPitchReviewRouter,
	playlistPlacement: playlistPlacementRouter,
	pressKit: pressKitRouter,
	product: productRouter,
	providerAccount: providerAccountRouter,
	spotify: spotifyRouter,
	stat: statRouter,
	stripeConnect: stripeConnectRouter,
	workflow: workflowRouter,
	workspace: workspaceRouter,
	workspaceInvite: workspaceInviteRouter,
	workspaceStripe: workspaceStripeRouter,
	track: trackRouter,
	user: userRouter,
	visitorSession: visitorSessionRouter,
});

type AppRouter = typeof appRouter;
type AppRouterInputs = inferRouterInputs<AppRouter>;
type AppRouterOutputs = inferRouterOutputs<AppRouter>;

export { appRouter, type AppRouter, type AppRouterInputs, type AppRouterOutputs };

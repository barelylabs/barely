import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

import { analyticsEndpointRouter } from '../analytics-endpoint.router';
import { authRouter } from '../auth/auth.router';
import { bioRouter } from '../bio.router';
import { campaignRouter } from '../campaign.router';
import { cartFunnelRouter } from '../cart-funnel.router';
import { domainRouter } from '../domain.router';
import { eventRouter } from '../event.router';
import { fileRouter } from '../file.router';
import { formResponseRouter } from '../form-response.router';
import { genreRouter } from '../genre.router';
import { linkRouter } from '../link.router';
import { mixtapeRouter } from '../mixtape.router';
import { playlistPitchReviewRouter } from '../playlist-pitch-review.router';
import { playlistPlacementRouter } from '../playlist-placement.router';
import { playlistRouter } from '../playlist.router';
import { pressKitRouter } from '../press-kit.router';
import { productRouter } from '../product.router';
import { providerAccountRouter } from '../provider-account.router';
import { cartRouter } from '../routes/cart/cart.router';
import { workspaceCheckoutRouter } from '../routes/workspace-checkout/workspace-checkout.router';
import { workspaceInviteRouter } from '../routes/workspace-invite/workspace-invite.router';
import { workspaceRouter } from '../routes/workspace/workspace.router';
import { spotifyRouter } from '../spotify.router';
import { statRouter } from '../stat.router';
import { stripeConnectRouter } from '../stripe-connect.router';
import { trackRouter } from '../track.router';
import { userRouter } from '../user.router';
import { visitorSessionRouter } from '../visitor-session.router';
import { createTRPCRouter } from './trpc';

const appRouter = createTRPCRouter({
	analyticsEndpoint: analyticsEndpointRouter,
	auth: authRouter,
	bio: bioRouter,
	campaign: campaignRouter,
	cart: cartRouter,
	cartFunnel: cartFunnelRouter,
	domain: domainRouter,
	event: eventRouter,
	file: fileRouter,
	formResponse: formResponseRouter,
	genre: genreRouter,
	link: linkRouter,
	mixtape: mixtapeRouter,
	playlist: playlistRouter,
	playlistPitchReview: playlistPitchReviewRouter,
	playlistPlacement: playlistPlacementRouter,
	pressKit: pressKitRouter,
	product: productRouter,
	providerAccount: providerAccountRouter,
	spotify: spotifyRouter,
	stat: statRouter,
	stripeConnect: stripeConnectRouter,
	workspace: workspaceRouter,
	workspaceInvite: workspaceInviteRouter,
	workspaceCheckout: workspaceCheckoutRouter,
	track: trackRouter,
	user: userRouter,
	visitorSession: visitorSessionRouter,
});

type AppRouter = typeof appRouter;
type AppRouterInputs = inferRouterInputs<AppRouter>;
type AppRouterOutputs = inferRouterOutputs<AppRouter>;

export { appRouter, type AppRouter, type AppRouterInputs, type AppRouterOutputs };

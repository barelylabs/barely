import type {
	inferRouterContext,
	inferRouterInputs,
	inferRouterOutputs,
} from '@trpc/server';

import { createTRPCRouter } from '../trpc';
import { analyticsEndpointRoute } from './analytics-endpoint.route';
import { authRoute } from './auth.route';
import { bioRoute } from './bio.route';
import { brandKitRouter } from './brand-kit.route';
import { campaignRoute } from './campaign.route';
import { cartFunnelRoute } from './cart-funnel.route';
import { cartOrderRoute } from './cart-order.route';
import { domainRoute } from './domain.route';
import { emailAddressRoute } from './email-address.route';
import { emailBroadcastRoute } from './email-broadcast.route';
import { emailDomainRoute } from './email-domain.route';
import { emailTemplateGroupRoute } from './email-template-group.route';
import { emailTemplateRoute } from './email-template.route';
import { fanGroupRoute } from './fan-group.route';
import { fanRoute } from './fan.route';
import { fileRoute } from './file.route';
import { flowRoute } from './flow.route';
import { fmRoute } from './fm.route';
import { formResponseRoute } from './form-response.route';
import { genreRoute } from './genre.route';
import { invoiceClientRoute } from './invoice-client.route';
import { invoiceRoute } from './invoice.route';
import { landingPageRoute } from './landing-page.route';
import { linkRoute } from './link.route';
import { mailchimpRoute } from './mailchimp.route';
import { mixtapeRoute } from './mixtape.route';
import { playlistPitchReviewRoute } from './playlist-pitch-review.route';
import { playlistPlacementRoute } from './playlist-placement.route';
import { playlistRoute } from './playlist.route';
import { pressKitRoute } from './press-kit.route';
import { productRoute } from './product.route';
import { providerAccountRoute } from './provider-account.route';
import { spotifyRoute } from './spotify.route';
import { statRoute } from './stat.route';
import { stripeConnectRoute } from './stripe-connect.route';
import { trackRoute } from './track.route';
import { userRoute } from './user.route';
import { vipSwapRoute } from './vip-swap.route';
import { visitorSessionRoute } from './visitor-session.route';
import { workspaceInviteRoute } from './workspace-invite.route';
import { workspaceStripeRoute } from './workspace-stripe.route';
import { workspaceRoute } from './workspace.route';

export const appRouter = createTRPCRouter({
	analyticsEndpoint: analyticsEndpointRoute,
	auth: authRoute,
	bio: bioRoute,
	brandKit: brandKitRouter,
	campaign: campaignRoute,
	cartFunnel: cartFunnelRoute,
	cartOrder: cartOrderRoute,
	emailAddress: emailAddressRoute,
	emailBroadcast: emailBroadcastRoute,
	emailDomain: emailDomainRoute,
	emailTemplate: emailTemplateRoute,
	emailTemplateGroup: emailTemplateGroupRoute,
	fan: fanRoute,
	fanGroup: fanGroupRoute,
	file: fileRoute,
	flow: flowRoute,
	fm: fmRoute,
	formResponse: formResponseRoute,
	genre: genreRoute,
	invoiceClient: invoiceClientRoute,
	invoice: invoiceRoute,
	landingPage: landingPageRoute,
	link: linkRoute,
	mixtape: mixtapeRoute,
	mailchimp: mailchimpRoute,
	playlist: playlistRoute,
	playlistPitchReview: playlistPitchReviewRoute,
	playlistPlacement: playlistPlacementRoute,
	pressKit: pressKitRoute,
	product: productRoute,
	providerAccount: providerAccountRoute,
	spotify: spotifyRoute,
	stat: statRoute,
	stripeConnect: stripeConnectRoute,
	webDomain: domainRoute,
	workspace: workspaceRoute,
	workspaceInvite: workspaceInviteRoute,
	workspaceStripe: workspaceStripeRoute,
	track: trackRoute,
	user: userRoute,
	visitorSession: visitorSessionRoute,
	vipSwap: vipSwapRoute,
});

export type AppRouter = typeof appRouter;
export type AppRouterInputs = inferRouterInputs<AppRouter>;
export type AppRouterOutputs = inferRouterOutputs<AppRouter>;
export type AppRouterContext = inferRouterContext<AppRouter>;
export type AppRouterKeys = keyof AppRouter;

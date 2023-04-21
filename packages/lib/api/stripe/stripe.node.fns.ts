import Stripe from 'stripe';

import { prisma } from '@barely/db';

import { SessionUser } from '../../auth/auth-options';
import env from '../../env';
import { fullName } from '../../utils/edge/name';
import { playlistPitchCostInDollars } from '../campaign/campaign.edge.fns';
import { CampaignWithTrackAndMetadata } from '../campaign/campaign.node.fns';
import { totalPlaylistReachByGenres } from '../playlist/playlist.node.fns';
import { StripePitchCampaignMetadata } from './stripe.schema';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
	apiVersion: '2022-11-15',
});

const createStripeUser = async (props: {
	userId: string;
	email: string;
	name: string;
	phone?: string;
}) => {
	const { userId, email, phone, name } = props;
	const customer = await stripe.customers.create({
		email,
		phone,
		name,
		metadata: {
			userId,
		},
	});

	const userWithStripe = await prisma.user.update({
		where: { id: userId },
		data: { stripeId: customer.id },
	});

	return userWithStripe;
};

const createPitchCheckoutLink = async (props: {
	user: SessionUser;
	campaign: CampaignWithTrackAndMetadata;
}) => {
	const { campaign } = props;

	if (!campaign.curatorReach) {
		throw new Error('Campaign must have a defined curator reach.');
	}

	const user = props.user.stripeId
		? props.user
		: await createStripeUser({
				userId: props.user.id,
				email: props.user.email,
				name: props.user.fullName ?? fullName(props.user.firstName, props.user.lastName),
				phone: props.user.phone ?? undefined,
		  });

	const successUrl = `${env.NEXT_PUBLIC_APP_BASE_URL}/campaigns/${campaign.id}?success=true`;
	const cancelUrl = `${env.NEXT_PUBLIC_APP_BASE_URL}/campaigns/${campaign.id}/launch`;

	const costInDollars = playlistPitchCostInDollars({
		curatorReach: campaign.curatorReach,
	});

	const { totalPlaylists, totalCurators } = await totalPlaylistReachByGenres(
		campaign.track.trackGenres.map(tg => tg.genre.name),
	);

	const estimatedPlaylists = Math.ceil(
		(campaign.curatorReach * totalPlaylists) / totalCurators,
	);

	const metadata: StripePitchCampaignMetadata = {
		userId: user.id,
		campaignId: campaign.id,
		trackName: campaign.track.name,
		curatorReach: campaign.curatorReach.toString(),
		estimatedPlaylistReach: estimatedPlaylists.toString(),
	};

	const session = await stripe.checkout.sessions.create({
		customer: user.stripeId ?? undefined,
		mode: 'payment',
		success_url: successUrl,
		cancel_url: cancelUrl,
		line_items: [
			{
				quantity: 1,
				price_data: {
					currency: 'usd',
					unit_amount: 100 * costInDollars,
					product_data: {
						name: `${campaign.track.name}`,
						description: `playlist.pitch · 🎧 ${estimatedPlaylists} playlists · 👥 ${campaign.curatorReach} curators`,
						images: [campaign.track.imageUrl ?? ''],
					},
				},
			},
		],
		client_reference_id: campaign.id,
		metadata,
	});

	return session.url;
};

export { createStripeUser, createPitchCheckoutLink };

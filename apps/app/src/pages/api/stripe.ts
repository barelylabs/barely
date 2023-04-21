import { IncomingMessage } from 'http';

import { NextApiResponse } from 'next';

import { buffer } from 'micro';
import Stripe from 'stripe';

import { assignPlaylistPitchToReviewers } from '@barely/api/playlist-pitch-review/playlist-pitch-review.node.fns';
import { stripePitchCampaignMetadataSchema } from '@barely/api/stripe/stripe.schema';
import { prisma } from '@barely/db';

import env from '~/env';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
	apiVersion: '2022-11-15',
});

const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

export const config = {
	api: {
		bodyParser: false,
	},
};

const handler = async (req: IncomingMessage, res: NextApiResponse) => {
	if (req.method !== 'POST') {
		res.setHeader('Allow', 'POST');
		res.status(405).end('Method Not Allowed');
	}

	const buf = await buffer(req);
	const sig = req.headers['stripe-signature'] as string;

	let event: Stripe.Event | undefined;

	try {
		event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
	} catch (err) {
		if (err instanceof Stripe.errors.StripeError) {
			console.log(`❌ Stripe error message: ${err.message}`);
			return res.status(400).send(`Webhook Error: ${err.message}`);
		}
	}

	if (!event) return res.status(400).send(`Webhook Error: event is undefined`);

	console.log('🔔 Stripe event received!', event.type);

	switch (event.type) {
		case 'checkout.session.completed': {
			const session = event.data.object as Stripe.Checkout.Session;

			console.log('session.metadata', session.metadata);

			const pitchCampaignMeta = stripePitchCampaignMetadataSchema.safeParse(
				session.metadata,
			);

			if (!pitchCampaignMeta.success) {
				console.log('error => ', pitchCampaignMeta.error);
			}

			if (pitchCampaignMeta.success) {
				const campaignMetadata = pitchCampaignMeta.data;
				console.log('🔔 Campaign metadata found!', campaignMetadata);

				// create transaction record
				await prisma.transaction.create({
					data: {
						completedAt: new Date(),
						amount: session.amount_total ?? 0,
						status: 'succeeded',
						stripeId: session.id,
						stripeMetadata: campaignMetadata,
						user: {
							connect: {
								id: campaignMetadata.userId,
							},
						},
					},
				});

				// create line item record(s)
				for (const lineItem of session.line_items?.data ?? []) {
					await prisma.lineItem.create({
						data: {
							totalDue: lineItem.amount_total ?? 0,
							paymentType: 'oneTime',
							name: `playlist.pitch :: ${campaignMetadata.trackName ?? ''}`,
							description: `🎧 ${campaignMetadata.estimatedPlaylistReach} playlists 👥 ${campaignMetadata.curatorReach} curators`,
							transaction: {
								connect: {
									id: session.id,
								},
							},
						},
					});
				}

				// update campaign to be active
				await prisma.campaign.update({
					where: {
						id: campaignMetadata.campaignId,
					},
					data: {
						stage: 'running',
					},
				});

				// assign to reviewers
				await assignPlaylistPitchToReviewers(campaignMetadata.campaignId);
			}

			break;
		}
		// case 'checkout.session.async_payment_succeeded': {
		//   const session = event.data.object as Stripe.Checkout.Session;
		//   console.log('🔔 Checkout session async payment succeeded!');
		//   console.log(session);
		//   break;
		// }
		// case 'checkout.session.async_payment_failed': {
		//   const session = event.data.object;
		//   console.log('🔔 Checkout session async payment failed!');
		//   console.log(session);
		//   break;
		// }

		default:
			console.log(`🔔 Unhandled event type ${event.type}`);
	}

	res.json({ received: true });
};

export default handler;

import type { NextRequest } from 'next/server';
import {
	handleStripePlanCheckoutSessionComplete,
	handleStripeSubscriptionUpdated,
} from '@barely/lib/functions/workspace-stripe.fns';
import Stripe from 'stripe';

import { appEnv } from '~/env';

const stripe = new Stripe(appEnv.STRIPE_SECRET_KEY, {
	apiVersion: '2025-07-30.basil',
});

const webhookSecret = appEnv.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
	const body = await req.text();
	const sig = req.headers.get('stripe-signature');

	if (!sig) return new Response('No signature', { status: 400 });

	let event: Stripe.Event | undefined;

	try {
		event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
	} catch (err) {
		if (err instanceof Stripe.errors.StripeError) {
			console.log(`❌ Stripe error message: ${err.message}`);
			return new Response(`Webhook Error: ${err.message}`, { status: 400 });
		}
	}

	if (!event) return new Response(`Webhook Error: event is undefined`, { status: 400 });

	console.log('🔔 Stripe event received!', event.type);

	switch (event.type) {
		case 'checkout.session.completed': {
			const session = event.data.object;
			console.log('session => ', session);
			console.log('session.metadata', session.metadata);

			const sessionWithLineItems = await stripe.checkout.sessions.retrieve(session.id, {
				expand: ['line_items.data.price.product'],
			});

			await handleStripePlanCheckoutSessionComplete(sessionWithLineItems);

			break;
		}

		case 'customer.subscription.updated': {
			const subscription = event.data.object;
			console.log('subscription => ', subscription);

			await handleStripeSubscriptionUpdated(subscription);

			break;
		}

		default:
			console.log(`🔔 Unhandled event type ${event.type}`);
	}

	return new Response(JSON.stringify({ received: true }), { status: 200 });
}

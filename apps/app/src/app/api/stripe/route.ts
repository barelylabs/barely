import type { NextRequest } from 'next/server';
import { db } from '@barely/server/db';
import { handleStripeCheckoutSessionComplete } from '@barely/server/stripe.fns';
import Stripe from 'stripe';

import { env } from '~/env';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
	apiVersion: '2023-10-16',
});

const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

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

			await handleStripeCheckoutSessionComplete(sessionWithLineItems, db);

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

	return new Response(JSON.stringify({ received: true }), { status: 200 });
}

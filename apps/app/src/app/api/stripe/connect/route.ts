import type { NextRequest } from 'next/server';
import { handleStripeConnectChargeSuccess } from '@barely/lib/server/routes/stripe-connect/stripe-connect.fns';
import Stripe from 'stripe';

import { env } from '~/env';

export const runtime = 'edge';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
	apiVersion: '2023-10-16',
	httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = env.STRIPE_CONNECT_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
	const body = await req.text();
	const sig = req.headers.get('stripe-signature');

	if (!sig) return new Response('No signature', { status: 400 });

	let event: Stripe.Event | undefined;

	try {
		event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
	} catch (err) {
		console.log('🔔 Stripe webhook error', err);

		if (err instanceof Stripe.errors.StripeError) {
			console.log(`❌ Stripe error message: ${err.message}`);
			return new Response(`Webhook Error: ${err.message}`, { status: 400 });
		}
	}

	if (!event) return new Response(`Webhook Error: event is undefined`, { status: 400 });

	console.log('🔔 Stripe event received!', event.type);

	switch (event.type) {
		case 'charge.succeeded': {
			const charge = event.data.object;
			// console.log('charge => ', charge);
			// console.log('session.metadata', charge.metadata);

			await handleStripeConnectChargeSuccess(charge);

			break;
		}

		default:
			console.log('Unhandled event', event.type);
	}

	return new Response(JSON.stringify({ received: true }), { status: 200 });
}

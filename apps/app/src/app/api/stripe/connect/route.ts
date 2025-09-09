import type { NextRequest } from 'next/server';
import { handleStripeConnectChargeSuccess } from '@barely/lib/functions/stripe-connect.fns';
import Stripe from 'stripe';

import { appEnv } from '~/env';

const stripe = new Stripe(appEnv.STRIPE_SECRET_KEY, {
	apiVersion: '2025-07-30.basil',
	httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = appEnv.STRIPE_CONNECT_WEBHOOK_SECRET;

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

			// Import the metadata schema and route based on payment type
			const { stripeConnectChargeMetadataSchema } = await import(
				'@barely/validators/schemas'
			);

			try {
				const metadata = stripeConnectChargeMetadataSchema.parse(charge.metadata);

				switch (metadata.paymentType) {
					case 'cart': {
						await handleStripeConnectChargeSuccess(charge, metadata);
						break;
					}
					case 'invoice': {
						const { handleStripeInvoiceChargeSuccess } = await import(
							'@barely/lib/functions/stripe-connect.fns'
						);
						await handleStripeInvoiceChargeSuccess(charge, metadata);
						break;
					}
					default:
						console.log('Unknown payment type in metadata:', metadata);
				}
			} catch (error) {
				console.log('Error parsing charge metadata:', error);
				console.log('Charge metadata:', charge.metadata);
				// For backward compatibility, try the old format
				await handleStripeConnectChargeSuccess(charge);
			}

			break;
		}

		case 'account.updated': {
			const account = event.data.object;
			console.log('🔔 Stripe Connect account updated:', account.id);

			const { handleStripeConnectAccountUpdated } = await import(
				'@barely/lib/functions/stripe-connect.fns'
			);
			await handleStripeConnectAccountUpdated(account);
			break;
		}

		case 'account.application.deauthorized': {
			const application = event.data.object;
			console.log('🔔 Stripe Connect application deauthorized:', application.id);

			const { handleStripeConnectAccountDeauthorized } = await import(
				'@barely/lib/functions/stripe-connect.fns'
			);
			await handleStripeConnectAccountDeauthorized(application);
			break;
		}

		case 'payment_intent.succeeded': {
			const paymentIntent = event.data.object;
			console.log('🔔 Payment intent succeeded:', paymentIntent.id);

			// Check if this payment intent has metadata indicating it's from our platform
			if ('paymentType' in paymentIntent.metadata) {
				const { handleStripePaymentIntentSuccess } = await import(
					'@barely/lib/functions/stripe-connect.fns'
				);
				handleStripePaymentIntentSuccess(paymentIntent);
			}
			break;
		}

		case 'payout.failed': {
			const payout = event.data.object;
			console.log('🔔 Payout failed:', payout.id);

			const { handleStripePayoutFailed } = await import(
				'@barely/lib/functions/stripe-connect.fns'
			);
			await handleStripePayoutFailed(payout);
			break;
		}

		case 'customer.subscription.updated': {
			const subscription = event.data.object;
			console.log('🔄 Subscription updated:', subscription.id);

			const { handleStripeSubscriptionUpdated } = await import(
				'@barely/lib/functions/stripe-connect.fns'
			);
			await handleStripeSubscriptionUpdated(subscription);
			break;
		}

		case 'customer.subscription.deleted': {
			const subscription = event.data.object;
			console.log('❌ Subscription deleted:', subscription.id);

			const { handleStripeSubscriptionDeleted } = await import(
				'@barely/lib/functions/stripe-connect.fns'
			);
			await handleStripeSubscriptionDeleted(subscription);
			break;
		}

		case 'invoice.payment_succeeded': {
			const invoice = event.data.object;
			console.log('💳 Invoice payment succeeded:', invoice.id);

			// Handle subscription invoice payments based on billing_reason
			if (
				invoice.billing_reason === 'subscription_cycle' ||
				invoice.billing_reason === 'subscription_create' ||
				invoice.billing_reason === 'subscription_update'
			) {
				const { handleStripeSubscriptionInvoiceSuccess } = await import(
					'@barely/lib/functions/stripe-connect.fns'
				);
				await handleStripeSubscriptionInvoiceSuccess(invoice);
			}
			break;
		}

		case 'invoice.payment_failed': {
			const invoice = event.data.object;
			console.log('❌ Invoice payment failed:', invoice.id);

			// Handle subscription invoice payment failures based on billing_reason
			if (
				invoice.billing_reason === 'subscription_cycle' ||
				invoice.billing_reason === 'subscription_create' ||
				invoice.billing_reason === 'subscription_update'
			) {
				const { handleStripeSubscriptionInvoiceFailed } = await import(
					'@barely/lib/functions/stripe-connect.fns'
				);
				await handleStripeSubscriptionInvoiceFailed(invoice);
			}
			break;
		}

		default:
			console.log('Unhandled event', event.type);
	}

	return new Response(JSON.stringify({ received: true }), { status: 200 });
}

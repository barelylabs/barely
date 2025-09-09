import type { Invoice, InvoiceClient, Workspace } from '@barely/validators/schemas';
import { getAbsoluteUrl, isProduction } from '@barely/utils';
import { TRPCError } from '@trpc/server';

import { libEnv } from '../../env';
import { stripe } from '../integrations/stripe';
import { getStripeConnectAccountId } from './stripe-connect.fns';

// DEPRECATED: Use createInvoicePaymentIntent instead for embedded payments
export async function createInvoicePaymentSession({
	invoice,
	workspace,
	successUrl,
	cancelUrl,
}: {
	invoice: Invoice & {
		client: {
			name: string;
			email: string;
		};
	};
	workspace: Pick<
		Workspace,
		| 'handle'
		| 'currency'
		| 'stripeConnectAccountId'
		| 'stripeConnectAccountId_devMode'
		| 'stripeConnectChargesEnabled'
		| 'stripeConnectChargesEnabled_devMode'
	>;
	successUrl?: string;
	cancelUrl?: string;
}) {
	// Check if Stripe Connect is enabled for this workspace
	const stripeChargesEnabled =
		isProduction() ?
			workspace.stripeConnectChargesEnabled
		:	workspace.stripeConnectChargesEnabled_devMode;

	if (!stripeChargesEnabled) {
		throw new Error('Payment processing is not enabled for this workspace');
	}

	const stripeConnectAccountId = getStripeConnectAccountId(workspace);
	if (!stripeConnectAccountId) {
		throw new Error('Stripe account not configured for this workspace');
	}

	// Default URLs if not provided
	const defaultSuccessUrl = getAbsoluteUrl(
		'invoice',
		`pay/${workspace.handle}/${invoice.id}/success`,
	);
	const defaultCancelUrl = getAbsoluteUrl(
		'invoice',
		`pay/${workspace.handle}/${invoice.id}`,
	);

	// Calculate platform fee from environment variable (default 0.5%)
	const platformFeePercentage = libEnv.PLATFORM_INVOICE_FEE_PERCENTAGE;
	const platformFeeAmount = Math.round(invoice.total * platformFeePercentage);

	// Create metadata for the charge
	const metadata = {
		paymentType: 'invoice' as const,
		invoiceId: invoice.id,
		workspaceId: invoice.workspaceId,
		invoiceNumber: invoice.invoiceNumber,
	};

	// Create Stripe Checkout session
	const session = await stripe.checkout.sessions.create(
		{
			mode: 'payment',
			payment_method_types: ['card'],
			// application_fee_amount: 10,
			line_items: [
				{
					price_data: {
						currency: workspace.currency,
						product_data: {
							name: `Invoice ${invoice.invoiceNumber}`,
							description:
								invoice.lineItems.length > 0 ?
									`${invoice.lineItems.length} item(s)`
								:	'Invoice payment',
						},
						unit_amount: invoice.total, // amount in cents
					},
					quantity: 1,
				},
			],
			payment_intent_data: {
				application_fee_amount: platformFeeAmount,
				metadata,
				on_behalf_of: stripeConnectAccountId,
				transfer_data: {
					destination: stripeConnectAccountId,
				},
			},
			customer_email: invoice.client.email,
			client_reference_id: invoice.id,
			success_url: successUrl ?? defaultSuccessUrl,
			cancel_url: cancelUrl ?? defaultCancelUrl,
			metadata,
		},
		{
			stripeAccount: stripeConnectAccountId,
		},
	);

	return {
		sessionId: session.id,
		sessionUrl: session.url,
	};
}

export async function createInvoicePaymentIntent({
	invoice,
	workspace,
	client,
}: {
	invoice: Invoice;
	workspace: Pick<
		Workspace,
		| 'id'
		| 'currency'
		| 'stripeConnectAccountId'
		| 'stripeConnectAccountId_devMode'
		| 'stripeConnectChargesEnabled'
		| 'stripeConnectChargesEnabled_devMode'
	>;
	client: Pick<InvoiceClient, 'id' | 'stripeCustomerId'>;
}) {
	// Add check for invoice type
	if (invoice.type === 'recurring') {
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: 'Recurring invoices should use subscription creation, not payment intents',
		});
	}
	// Check if Stripe Connect is enabled for this workspace
	const stripeChargesEnabled =
		isProduction() ?
			workspace.stripeConnectChargesEnabled
		:	workspace.stripeConnectChargesEnabled_devMode;

	if (!stripeChargesEnabled) {
		throw new Error('Payment processing is not enabled for this workspace');
	}

	const stripeConnectAccountId = getStripeConnectAccountId(workspace);
	if (!stripeConnectAccountId) {
		throw new Error('Stripe account not configured for this workspace');
	}

	// Calculate platform fee from environment variable (default 0.5%)
	const platformFeePercentage = libEnv.PLATFORM_INVOICE_FEE_PERCENTAGE;
	const platformFeeAmount = Math.round(invoice.total * platformFeePercentage);

	// Create metadata for the charge
	const metadata = {
		paymentType: 'invoice' as const,
		invoiceId: invoice.id,
		workspaceId: invoice.workspaceId,
		invoiceNumber: invoice.invoiceNumber,
		clientId: client.id, // Add clientId for webhook processing
	};

	// Create payment intent with setup_future_usage to save payment method
	const paymentIntent = await stripe.paymentIntents.create(
		{
			amount: invoice.total, // amount in cents
			currency: workspace.currency,
			application_fee_amount: platformFeeAmount,
			customer: client.stripeCustomerId,
			setup_future_usage: 'off_session', // Save payment method for future use
			metadata,
		},
		{
			stripeAccount: stripeConnectAccountId,
		},
	);

	return {
		clientSecret: paymentIntent.client_secret,
		stripeConnectAccountId,
	};
}

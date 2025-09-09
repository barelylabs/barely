import type { Invoice, Workspace } from '@barely/validators/schemas';
import { isProduction } from '@barely/utils';

import { libEnv } from '../../env';
import { stripe } from '../integrations/stripe';
import { getStripeConnectAccountId } from './stripe-connect.fns';

export async function createInvoiceSubscription({
	invoice,
	workspace,
	customerId,
}: {
	invoice: Invoice;
	workspace: Pick<
		Workspace,
		| 'currency'
		| 'stripeConnectAccountId'
		| 'stripeConnectAccountId_devMode'
		| 'stripeConnectChargesEnabled'
		| 'stripeConnectChargesEnabled_devMode'
	>;
	customerId: string;
}) {
	// Validation checks (similar to payment intent)
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

	// Calculate recurring total with discount
	const recurringTotal = calculateRecurringTotal(
		invoice.total,
		invoice.recurringDiscountPercent,
	);

	const metadata = {
		paymentType: 'invoice' as const,
		invoiceId: invoice.id,
		workspaceId: invoice.workspaceId,
		invoiceNumber: invoice.invoiceNumber,
	};

	// First create a product for the subscription
	const product = await stripe.products.create(
		{
			name: `Invoice ${invoice.invoiceNumber}`,
			description: `Recurring payment for invoice ${invoice.invoiceNumber}`,
			metadata,
		},
		{ stripeAccount: stripeConnectAccountId },
	);

	// Create subscription with the price
	const subscription = await stripe.subscriptions.create(
		{
			customer: customerId,
			items: [
				{
					price_data: {
						currency: workspace.currency,
						product: product.id,
						recurring: {
							interval: invoice.billingInterval === 'yearly' ? 'year' : 'month',
							...(invoice.billingInterval === 'quarterly' && { interval_count: 3 }),
						},
						unit_amount: recurringTotal,
					},
				},
			],
			application_fee_percent: libEnv.PLATFORM_INVOICE_FEE_PERCENTAGE,
			metadata,
			expand: ['latest_invoice.confirmation_secret'],
			payment_behavior: 'default_incomplete',
			payment_settings: {
				save_default_payment_method: 'on_subscription',
			},
		},
		{ stripeAccount: stripeConnectAccountId },
	);

	const latestInvoice = subscription.latest_invoice;
	if (!latestInvoice) {
		throw new Error('Latest invoice not found');
	}
	if (typeof latestInvoice === 'string') {
		throw new Error('Latest invoice payment intent is a string');
	}
	const clientSecret = latestInvoice.confirmation_secret?.client_secret;
	if (!clientSecret) {
		throw new Error('Client secret not found');
	}

	// const checkoutSession = await stripe.checkout.sessions.create({
	//     ui_mode: 'embedded',
	//     customer: customerId,
	//     line_items: [
	//         {
	//             price: product.id,
	//             quantity: 1,
	//         },
	//     ],
	//     payment_intent_data: {
	//         application_fee
	//     }

	//     metadata,
	//     mode: 'subscription',

	// }, { stripeAccount: stripeConnectAccountId });

	// const latestInvoice = subscription.latest_invoice;

	// const clientSecret = latestInvoice?.payment_intent?.client_secret;

	return {
		subscriptionId: subscription.id,
		clientSecret,
		stripeConnectAccountId,
	};
}

export function calculateRecurringTotal(
	originalTotal: number,
	discountPercent: number,
): number {
	if (discountPercent <= 0) return originalTotal;

	const discountAmount = Math.round(originalTotal * (discountPercent / 100));
	return originalTotal - discountAmount;
}

export function calculateRecurringDiscount(
	originalTotal: number,
	discountPercent: number,
): number {
	return Math.round(originalTotal * (discountPercent / 100));
}

export function calculateAnnualSavings(
	originalTotal: number,
	discountPercent: number,
	billingInterval: string,
): number {
	const monthlyDiscount = calculateRecurringDiscount(originalTotal, discountPercent);

	switch (billingInterval) {
		case 'monthly':
			return monthlyDiscount * 12;
		case 'quarterly':
			return monthlyDiscount * 4;
		case 'yearly':
			return monthlyDiscount;
		default:
			return 0;
	}
}

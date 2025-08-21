import { dbHttp } from '@barely/db/client';
import { Invoices } from '@barely/db/sql';
import { desc, eq } from 'drizzle-orm';

import { libEnv } from '../../env';

export async function generateInvoiceNumber(
	workspaceId: string,
	workspacePrefix: string,
) {
	// Get the last invoice number for this workspace
	const lastInvoice = await dbHttp
		.select({ invoiceNumber: Invoices.invoiceNumber })
		.from(Invoices)
		.where(eq(Invoices.workspaceId, workspaceId))
		.orderBy(desc(Invoices.createdAt))
		.limit(1);

	let nextNumber = 1;

	if (lastInvoice[0]) {
		// Extract the number from the last invoice
		// Format: INV-{workspacePrefix}-{number}
		const parts = lastInvoice[0].invoiceNumber.split('-');
		const currentNumber = parseInt(parts[parts.length - 1] ?? '0');
		if (!isNaN(currentNumber)) {
			nextNumber = currentNumber + 1;
		}
	}

	// Format: INV-{workspacePrefix}-{paddedNumber}
	const paddedNumber = nextNumber.toString().padStart(6, '0');
	return `INV-${workspacePrefix.toUpperCase()}-${paddedNumber}`;
}

export function calculateInvoiceTotal(
	lineItems: { amount: number }[],
	taxPercentage: number,
) {
	const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
	const taxAmount = Math.round(subtotal * (taxPercentage / 10000)); // Tax is stored as percentage * 100
	const total = subtotal + taxAmount;

	return {
		subtotal,
		taxAmount,
		total,
	};
}

export async function createInvoicePaymentIntent({
	invoiceId,
	amount, // in cents
	workspaceId,
	stripeConnectAccountId,
}: {
	invoiceId: string;
	amount: number;
	workspaceId: string;
	stripeConnectAccountId: string;
}) {
	const { stripe } = await import('../integrations/stripe');

	const metadata = {
		paymentType: 'invoice' as const,
		invoiceId,
		workspaceId,
	};

	const paymentIntent = await stripe.paymentIntents.create(
		{
			amount,
			currency: 'usd',
			metadata,
			application_fee_amount: Math.round(amount * libEnv.PLATFORM_FEE_PERCENTAGE), // Platform fee from env
		},
		{
			stripeAccount: stripeConnectAccountId,
			idempotencyKey: `invoice-${invoiceId}`,
		},
	);

	return paymentIntent;
}

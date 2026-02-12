import { dbHttp } from '@barely/db/client';
import { Invoices, Workspaces } from '@barely/db/sql';
import { tasks } from '@trigger.dev/sdk/v3';
import { and, desc, eq, isNull } from 'drizzle-orm';

import type { sendUsageWarning } from '../trigger';
import { libEnv } from '../../env';
import { checkUsageLimit, getBlockedMessage, incrementUsage } from './usage.fns';

export async function getInvoiceById({
	invoiceId,
	workspaceId,
}: {
	invoiceId: string;
	workspaceId?: string;
}) {
	const invoice = await dbHttp.query.Invoices.findFirst({
		where: and(
			eq(Invoices.id, invoiceId),
			isNull(Invoices.deletedAt),
			workspaceId ? eq(Invoices.workspaceId, workspaceId) : undefined,
		),
		with: {
			workspace: {
				columns: {
					id: true,
					name: true,
					handle: true,
					shippingAddressLine1: true,
					shippingAddressLine2: true,
					shippingAddressCity: true,
					shippingAddressState: true,
					shippingAddressPostalCode: true,
					shippingAddressCountry: true,

					stripeCustomerId: true,
					stripeCustomerId_devMode: true,
					currency: true,
					supportEmail: true,
					invoiceSupportEmail: true,
					cartSupportEmail: true,
					invoiceAddressLine1: true,
					invoiceAddressLine2: true,
					invoiceAddressCity: true,
					invoiceAddressState: true,
					invoiceAddressPostalCode: true,
					invoiceAddressCountry: true,
					stripeConnectAccountId: true,
					stripeConnectAccountId_devMode: true,
					stripeConnectChargesEnabled: true,
					stripeConnectChargesEnabled_devMode: true,
				},
			},
			client: {
				columns: {
					id: true,
					name: true,
					email: true,
					company: true,
					addressLine1: true,
					addressLine2: true,
					city: true,
					state: true,
					postalCode: true,
					country: true,
					stripeCustomerId: true,
				},
			},
		},
	});

	return invoice;
}

export async function checkInvoiceUsageAndIncrement(workspaceId: string) {
	// Get the workspace to check plan for error message
	const workspace = await dbHttp.query.Workspaces.findFirst({
		where: eq(Workspaces.id, workspaceId),
	});

	if (!workspace) {
		throw new Error('Workspace not found');
	}

	// Check usage limits using unified function
	const usageResult = await checkUsageLimit(workspaceId, 'invoices');

	// Hard block at 200%
	if (usageResult.status === 'blocked_200') {
		throw new Error(getBlockedMessage('invoices', usageResult.limit, workspace.plan));
	}

	// Trigger warning email if needed (async, don't await)
	if (usageResult.shouldSendEmail) {
		const threshold =
			usageResult.status === 'warning_100' ? 100
			: usageResult.status === 'warning_80' ? 80
			: null;
		if (threshold) {
			void tasks.trigger<typeof sendUsageWarning>('send-usage-warning-email', {
				workspaceId,
				limitType: 'invoices',
				threshold,
			});
		}
	}

	// Increment the usage counter
	await incrementUsage(workspaceId, 'invoices', 1);
}

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
	currency = 'usd',
}: {
	invoiceId: string;
	amount: number;
	workspaceId: string;
	stripeConnectAccountId: string;
	currency?: 'usd' | 'gbp';
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
			currency,
			metadata,
			application_fee_amount: Math.round(
				(amount * libEnv.PLATFORM_INVOICE_FEE_PERCENTAGE) / 100,
			), // Platform fee from env
		},
		{
			stripeAccount: stripeConnectAccountId,
			idempotencyKey: `invoice-${invoiceId}`,
		},
	);

	return paymentIntent;
}

import { WORKSPACE_PLANS } from '@barely/const';
import { dbHttp } from '@barely/db/client';
import { Invoices, Workspaces } from '@barely/db/sql';
import { getFirstAndLastDayOfBillingCycle, raise } from '@barely/utils';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';

import { libEnv } from '../../env';

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
	// Get the workspace with current usage and plan
	const workspace = await dbHttp.query.Workspaces.findFirst({
		where: eq(Workspaces.id, workspaceId),
	});

	if (!workspace) {
		throw new Error('Workspace not found');
	}

	// Get the plan details
	const plan = WORKSPACE_PLANS.get(workspace.plan);
	if (!plan) {
		throw new Error('Invalid workspace plan');
	}

	// Get the usage limit, considering override
	const invoiceLimit =
		workspace.invoiceUsageLimitOverride ?? plan.usageLimits.invoicesPerMonth;

	// Check if we're at the limit (unless it's unlimited)
	if (
		invoiceLimit !== Number.MAX_SAFE_INTEGER &&
		workspace.invoiceUsage >= invoiceLimit
	) {
		// Check if we need to reset based on billing cycle
		const { firstDay } = getFirstAndLastDayOfBillingCycle(
			workspace.billingCycleStart ?? 0,
		);

		// Count invoices created this billing cycle
		const invoicesThisCycle = await dbHttp
			.select({ count: sql<number>`count(*)` })
			.from(Invoices)
			.where(
				sql`${Invoices.workspaceId} = ${workspaceId} AND ${Invoices.createdAt} >= ${firstDay}`,
			);

		const currentCycleCount = invoicesThisCycle[0]?.count ?? 0;

		// If the count in the database doesn't match our stored usage,
		// it might be a new billing cycle - update the stored usage
		if (currentCycleCount < workspace.invoiceUsage) {
			// Reset the counter for new billing cycle
			await dbHttp
				.update(Workspaces)
				.set({ invoiceUsage: currentCycleCount })
				.where(eq(Workspaces.id, workspaceId));

			// Re-check if we're still at the limit
			if (currentCycleCount >= invoiceLimit) {
				const planName = plan.name;
				if (workspace.plan === 'free') {
					throw new Error(
						`You've reached your limit of ${invoiceLimit} invoices per month on the ${planName} plan. Upgrade to Invoice Pro for unlimited invoices.`,
					);
				} else {
					throw new Error(
						`You've reached your limit of ${invoiceLimit} invoices per month on the ${planName} plan. Please upgrade your plan for more invoices.`,
					);
				}
			}
		} else if (currentCycleCount >= invoiceLimit) {
			const planName = plan.name;
			if (workspace.plan === 'free') {
				raise(
					`You've reached your limit of ${invoiceLimit} invoices per month on the ${planName} plan. Upgrade to Invoice Pro for unlimited invoices.`,
				);
			} else {
				raise(
					`You've reached your limit of ${invoiceLimit} invoices per month on the ${planName} plan. Please upgrade your plan for more invoices.`,
				);
			}
		}
	}

	// Increment the usage counter
	await dbHttp
		.update(Workspaces)
		.set({ invoiceUsage: sql`${Workspaces.invoiceUsage} + 1` })
		.where(eq(Workspaces.id, workspaceId));
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

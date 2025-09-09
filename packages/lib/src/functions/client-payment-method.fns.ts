import type { Stripe } from 'stripe';
import { dbHttp } from '@barely/db/client';
import { ClientPaymentMethods } from '@barely/db/sql/client-payment-method.sql';
import { newId } from '@barely/utils';
import { and, eq, isNull, ne } from 'drizzle-orm';

interface SavePaymentMethodParams {
	clientId: string;
	stripePaymentMethod: Stripe.PaymentMethod | string;
	stripeConnectAccountId: string;
	setAsDefault?: boolean;
	lastUsedAt?: Date;
}

export async function saveClientPaymentMethod({
	clientId,
	stripePaymentMethod,
	stripeConnectAccountId,
	setAsDefault = false,
	lastUsedAt,
}: SavePaymentMethodParams) {
	// Fetch full payment method details if only ID provided
	let paymentMethod: Stripe.PaymentMethod;

	if (typeof stripePaymentMethod === 'string') {
		const { stripe } = await import('../integrations/stripe');
		paymentMethod = await stripe.paymentMethods.retrieve(stripePaymentMethod, {
			stripeAccount: stripeConnectAccountId,
		});
	} else {
		paymentMethod = stripePaymentMethod;
	}

	// Check if this payment method already exists (by fingerprint)
	const fingerprint =
		paymentMethod.card?.fingerprint ?? paymentMethod.us_bank_account?.fingerprint ?? null;

	if (fingerprint) {
		const existing = await dbHttp.query.ClientPaymentMethods.findFirst({
			where: and(
				eq(ClientPaymentMethods.clientId, clientId),
				eq(ClientPaymentMethods.fingerprint, fingerprint),
				isNull(ClientPaymentMethods.deletedAt),
			),
		});

		if (existing) {
			// Update last used and potentially default status
			await dbHttp
				.update(ClientPaymentMethods)
				.set({
					lastUsedAt: lastUsedAt ?? new Date(),
					isDefault: setAsDefault ? true : existing.isDefault,
				})
				.where(eq(ClientPaymentMethods.id, existing.id));

			if (setAsDefault && !existing.isDefault) {
				await clearDefaultPaymentMethods(clientId, existing.id);
			}

			console.log('✅ Updated existing payment method:', existing.id);
			return existing.id;
		}
	}

	// If setting as default, clear other defaults first
	if (setAsDefault) {
		await clearDefaultPaymentMethods(clientId);
	}

	// Extract payment method details based on type
	const paymentMethodData = {
		id: newId('invoiceClientPaymentMethod'),
		clientId,
		stripePaymentMethodId: paymentMethod.id,
		type: paymentMethod.type as 'card' | 'us_bank_account' | 'link' | 'cashapp',
		fingerprint,
		isDefault: setAsDefault,
		lastUsedAt: lastUsedAt ?? new Date(),

		// Card details
		...(paymentMethod.card && {
			last4: paymentMethod.card.last4,
			brand: paymentMethod.card.brand,
			expiryMonth: paymentMethod.card.exp_month,
			expiryYear: paymentMethod.card.exp_year,
		}),

		// Bank account details
		...(paymentMethod.us_bank_account && {
			last4: paymentMethod.us_bank_account.last4,
			bankName: paymentMethod.us_bank_account.bank_name,
			accountType: paymentMethod.us_bank_account.account_type,
		}),

		// Link details
		...(paymentMethod.link && {
			last4: paymentMethod.link.email?.substring(0, 4) ?? '****',
		}),

		// CashApp details
		...(paymentMethod.cashapp && {
			last4: paymentMethod.cashapp.cashtag?.substring(0, 4) ?? '****',
		}),
	};

	const [newPaymentMethod] = await dbHttp
		.insert(ClientPaymentMethods)
		.values(paymentMethodData)
		.returning();

	if (!newPaymentMethod) {
		throw new Error('Failed to create new payment method');
	}

	console.log('✅ Created new payment method:', newPaymentMethod.id);
	return newPaymentMethod.id;
}

async function clearDefaultPaymentMethods(clientId: string, exceptId?: string) {
	const whereClause =
		exceptId ?
			and(
				eq(ClientPaymentMethods.clientId, clientId),
				eq(ClientPaymentMethods.isDefault, true),
				isNull(ClientPaymentMethods.deletedAt),
				ne(ClientPaymentMethods.id, exceptId),
			)
		:	and(
				eq(ClientPaymentMethods.clientId, clientId),
				eq(ClientPaymentMethods.isDefault, true),
				isNull(ClientPaymentMethods.deletedAt),
			);

	await dbHttp.update(ClientPaymentMethods).set({ isDefault: false }).where(whereClause);
}

export async function setDefaultPaymentMethod(clientId: string, paymentMethodId: string) {
	// Clear all other defaults
	await clearDefaultPaymentMethods(clientId);

	// Set the new default
	await dbHttp
		.update(ClientPaymentMethods)
		.set({ isDefault: true })
		.where(
			and(
				eq(ClientPaymentMethods.id, paymentMethodId),
				eq(ClientPaymentMethods.clientId, clientId),
				isNull(ClientPaymentMethods.deletedAt),
			),
		);
}

export async function getClientHasDefaultPaymentMethod(
	clientId: string,
): Promise<boolean> {
	const defaultMethod = await dbHttp.query.ClientPaymentMethods.findFirst({
		where: and(
			eq(ClientPaymentMethods.clientId, clientId),
			eq(ClientPaymentMethods.isDefault, true),
			isNull(ClientPaymentMethods.deletedAt),
		),
	});

	return !!defaultMethod;
}

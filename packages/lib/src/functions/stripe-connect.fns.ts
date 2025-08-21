import type { UpdateCart, Workspace } from '@barely/validators/schemas';
import { dbHttp } from '@barely/db/client';
import { Carts } from '@barely/db/sql/cart.sql';
import { Fans } from '@barely/db/sql/fan.sql';
import { Flow_Triggers } from '@barely/db/sql/flow.sql';
import { Workspaces } from '@barely/db/sql/workspace.sql';
import { isProduction, raise } from '@barely/utils';
import { stripeConnectChargeMetadataSchema } from '@barely/validators/schemas';
import { tasks } from '@trigger.dev/sdk/v3';
import { and, eq, or } from 'drizzle-orm';
import { Stripe } from 'stripe';

import type { handleAbandonedUpsell } from '../trigger/cart.trigger';
import type { handleFlow } from '../trigger/flow.trigger';
import { stripe } from '../integrations/stripe';
import {
	createOrderIdForCart,
	getCartById,
	incrementAssetValuesOnCartPurchase,
	sendCartReceiptEmail,
} from './cart.fns';
import { queueEmailRetry } from './email-retry.fns';
import { recordCartEvent } from './event.fns';
import { createFan } from './fan.fns';
import { sendInvoicePaymentReceivedEmail } from './invoice-email.fns';

export async function handleStripeConnectChargeSuccess(
	charge: Stripe.Charge,
	metadata?: { paymentType: 'cart'; cartId: string; preChargeCartStage: string },
) {
	// For backward compatibility, parse metadata if not provided
	const parsedMetadata =
		metadata ?? stripeConnectChargeMetadataSchema.parse(charge.metadata);

	// Extract cart-specific data
	if (parsedMetadata.paymentType !== 'cart') {
		throw new Error('Invalid payment type for cart handler');
	}

	const { cartId, preChargeCartStage } = parsedMetadata;

	const prevCart = (await getCartById(cartId)) ?? raise('cart not found');
	const cartFunnel = prevCart.funnel ?? raise('funnel not found');

	let stripeCustomerId =
		typeof charge.customer === 'string' ? charge.customer : charge.customer?.id;

	if (!stripeCustomerId) {
		try {
			const customer = await stripe.customers.create(
				{
					name: charge.billing_details.name ?? undefined,
					email: charge.billing_details.email ?? undefined,
					payment_method: charge.payment_method ?? undefined,
				},
				{
					stripeAccount:
						getStripeConnectAccountId(prevCart.workspace) ??
						raise('stripeConnectAccountId not found'),
				},
			);

			stripeCustomerId = customer.id;
		} catch (err) {
			if (err instanceof Stripe.errors.StripeError) {
				console.log('error:', err);
				if (err.type === 'StripeInvalidRequestError') {
					// try to find the customer by email
					const customers = await stripe.customers.list({
						email: charge.billing_details.email ?? undefined,
					});

					if (customers.data[0]) {
						stripeCustomerId = customers.data[0].id;
					}
				}
			}
		}
	}

	/* update cart */
	if (
		preChargeCartStage === 'checkoutCreated' ||
		preChargeCartStage === 'checkoutAbandoned'
	) {
		const updateCart: UpdateCart = { id: prevCart.id };

		updateCart.orderId = await createOrderIdForCart(prevCart);

		updateCart.stage = cartFunnel.upsellProductId ? 'upsellCreated' : 'checkoutConverted';
		updateCart.checkoutStripeChargeId = charge.id;
		updateCart.checkoutStripePaymentMethodId = charge.payment_method;

		updateCart.fullName =
			charge.shipping?.name ?? charge.billing_details.name ?? prevCart.fullName;
		updateCart.shippingAddressLine1 = charge.shipping?.address?.line1;
		updateCart.shippingAddressLine2 = charge.shipping?.address?.line2;
		updateCart.shippingAddressCity = charge.shipping?.address?.city;
		updateCart.shippingAddressState = charge.shipping?.address?.state;
		updateCart.shippingAddressPostalCode = charge.shipping?.address?.postal_code;
		updateCart.shippingAddressCountry = charge.shipping?.address?.country;
		updateCart.checkoutConvertedAt = new Date();

		// update or create fan
		let fan =
			prevCart.fan ??
			((stripeCustomerId ?? charge.billing_details.email) ?
				await dbHttp.query.Fans.findFirst({
					where: or(
						charge.billing_details.email ?
							eq(Fans.email, charge.billing_details.email)
						:	undefined,
						stripeCustomerId ? eq(Fans.stripeCustomerId, stripeCustomerId) : undefined,
					),
				})
			:	undefined);

		if (fan) {
			updateCart.fanId = fan.id;
			await dbHttp
				.update(Fans)
				.set({
					stripeCustomerId,
					stripePaymentMethodId: charge.payment_method,
				})
				.where(eq(Fans.id, fan.id));
		} else {
			fan = await createFan({
				workspaceId: prevCart.workspaceId,
				fullName: charge.billing_details.name ?? prevCart.fullName ?? '',
				email: charge.billing_details.email ?? prevCart.email ?? '',

				shippingAddressLine1: charge.shipping?.address?.line1,
				shippingAddressLine2: charge.shipping?.address?.line2,
				shippingAddressCity: charge.shipping?.address?.city,
				shippingAddressState: charge.shipping?.address?.state,
				shippingAddressPostalCode: charge.shipping?.address?.postal_code,
				shippingAddressCountry: charge.shipping?.address?.country,

				billingAddressPostalCode: charge.billing_details.address?.postal_code,
				billingAddressCountry: charge.billing_details.address?.country,

				stripeCustomerId,
				stripePaymentMethodId: charge.payment_method,

				emailMarketingOptIn: prevCart.emailMarketingOptIn ?? false,
				smsMarketingOptIn: prevCart.smsMarketingOptIn ?? false,
			});
			updateCart.fanId = fan.id;
		}

		const updatedCart = (
			await dbHttp.update(Carts).set(updateCart).where(eq(Carts.id, cartId)).returning()
		)[0] ?? {
			...prevCart,
			...updateCart,
		};

		await recordCartEvent({
			cart: updatedCart,
			cartFunnel: cartFunnel,
			type:
				updatedCart.addedBump ?
					'cart/purchaseMainWithBump'
				:	'cart/purchaseMainWithoutBump',
		}).catch(err => {
			console.log('error recording cart event:', err);
		});

		// increment value
		await incrementAssetValuesOnCartPurchase(
			prevCart,
			prevCart.addedBump ?
				prevCart.mainProductPrice + (prevCart.bumpProductPrice ?? 0)
			:	prevCart.mainProductPrice,
		);

		if (updateCart.stage === 'upsellCreated') {
			await tasks.trigger<typeof handleAbandonedUpsell>('handle-abandoned-upsell', {
				cartId: prevCart.id,
			}); // this waits 5 minutes and then marks the cart abandoned if it hasn't been converted or declined
		} else {
			await sendCartReceiptEmail({
				...prevCart,
				...updateCart,
				fan,
				funnel: cartFunnel,
				mainProduct: cartFunnel.mainProduct,
				bumpProduct: cartFunnel.bumpProduct,
				upsellProduct: cartFunnel.upsellProduct,
			});
		}

		// check for any triggers
		const newCartOrderTriggers = await dbHttp.query.Flow_Triggers.findMany({
			where: and(
				eq(Flow_Triggers.type, 'newCartOrder'),
				eq(Flow_Triggers.cartFunnelId, cartFunnel.id),
			),
		});

		for (const trigger of newCartOrderTriggers) {
			// todo: abstract this to a function. require cartOrderId and fanId
			await tasks.trigger<typeof handleFlow>('handle-flow', {
				triggerId: trigger.id,
				cartId: prevCart.id,
				fanId: fan.id,
			});
		}

		// newFan triggers
		if (!prevCart.fan) {
			// i.e. we just created a fan
			const newFanTriggers = await dbHttp.query.Flow_Triggers.findMany({
				where: and(
					eq(Flow_Triggers.type, 'newFan'),
					eq(Flow_Triggers.workspaceId, prevCart.workspaceId),
				),
			});

			for (const trigger of newFanTriggers) {
				// todo: abstract this to a function. require fanId
				await tasks.trigger<typeof handleFlow>('handle-flow', {
					triggerId: trigger.id,
					fanId: fan.id,
				});
			}
		}
	}
	return;
}

export function getStripeConnectAccountId(
	workspace: Pick<Workspace, 'stripeConnectAccountId' | 'stripeConnectAccountId_devMode'>,
) {
	return isProduction() ?
			workspace.stripeConnectAccountId
		:	workspace.stripeConnectAccountId_devMode;
}

export async function handleStripeInvoiceChargeSuccess(
	charge: Stripe.Charge,
	metadata: { paymentType: 'invoice'; invoiceId: string; workspaceId: string },
) {
	const { invoiceId, workspaceId } = metadata;

	console.log('🧾 Processing invoice payment:', { invoiceId, chargeId: charge.id });

	// Import invoice table
	const { Invoices } = await import('@barely/db/sql/invoice.sql');

	// Get the invoice with related data
	const invoice = await dbHttp.query.Invoices.findFirst({
		where: eq(Invoices.id, invoiceId),
		with: {
			client: true,
			workspace: true,
		},
	});

	if (!invoice) {
		console.error('Invoice not found:', invoiceId);
		return;
	}

	// Verify workspace matches
	if (invoice.workspaceId !== workspaceId) {
		console.error('Workspace mismatch for invoice:', {
			invoiceId,
			expected: workspaceId,
			actual: invoice.workspaceId,
		});
		return;
	}

	// Update invoice status to paid
	const paidAt = new Date();
	await dbHttp
		.update(Invoices)
		.set({
			status: 'paid',
			stripePaymentIntentId:
				typeof charge.payment_intent === 'string' ?
					charge.payment_intent
				:	charge.payment_intent?.id,
			paidAt,
		})
		.where(eq(Invoices.id, invoiceId));

	console.log('✅ Invoice marked as paid:', invoiceId);

	// Send payment confirmation email
	try {
		// Extract payment method details from charge
		const paymentMethod =
			charge.payment_method_details?.card ?
				`${charge.payment_method_details.card.brand} **** ${charge.payment_method_details.card.last4}`
			:	(charge.payment_method_details?.type ?? 'Card');

		// Send payment confirmation email with retry (non-blocking)
		queueEmailRetry(
			() =>
				sendInvoicePaymentReceivedEmail({
					invoice: {
						...invoice,
						status: 'paid',
						paidAt,
					},
					paymentDetails: {
						paymentMethod,
						transactionId: charge.id,
					},
				}),
			`Payment confirmation for invoice ${invoice.invoiceNumber}`,
			{
				maxRetries: 5, // More retries for payment confirmations
				retryDelay: 3000,
				backoffMultiplier: 2,
			},
		);

		console.log('✅ Payment confirmation email sent for invoice:', invoiceId);
	} catch (error) {
		console.error('Failed to send payment confirmation email:', error);
		// Don't throw - we don't want to fail the webhook if email fails
	}

	// TODO: Record analytics event
}

export async function handleStripeConnectAccountUpdated(account: Stripe.Account) {
	console.log('📊 Processing Connect account update:', account.id);

	// Find workspace by Stripe account ID
	const workspace = await dbHttp.query.Workspaces.findFirst({
		where: or(
			eq(Workspaces.stripeConnectAccountId, account.id),
			eq(Workspaces.stripeConnectAccountId_devMode, account.id),
		),
	});

	if (!workspace) {
		console.log('No workspace found for Stripe account:', account.id);
		return;
	}

	// Determine which field to update based on environment
	const isDevMode = workspace.stripeConnectAccountId_devMode === account.id;
	const updateData: Partial<typeof Workspaces.$inferInsert> = {};

	// Update charges enabled status
	if (account.charges_enabled) {
		if (isDevMode) {
			updateData.stripeConnectChargesEnabled_devMode = true;
		} else {
			updateData.stripeConnectChargesEnabled = true;
		}
		console.log('✅ Charges enabled for workspace:', workspace.handle);
	} else {
		if (isDevMode) {
			updateData.stripeConnectChargesEnabled_devMode = false;
		} else {
			updateData.stripeConnectChargesEnabled = false;
		}
		console.log('⚠️ Charges disabled for workspace:', workspace.handle);
	}

	// Update details submitted status
	if (account.details_submitted) {
		if (isDevMode) {
			updateData.stripeConnectDetailsSubmitted_devMode = true;
		} else {
			updateData.stripeConnectDetailsSubmitted = true;
		}
	}

	// Update payouts enabled status
	if (account.payouts_enabled) {
		if (isDevMode) {
			updateData.stripeConnectPayoutsEnabled_devMode = true;
		} else {
			updateData.stripeConnectPayoutsEnabled = true;
		}
	} else {
		if (isDevMode) {
			updateData.stripeConnectPayoutsEnabled_devMode = false;
		} else {
			updateData.stripeConnectPayoutsEnabled = false;
		}
	}

	// Update last status check timestamp
	updateData.stripeConnectLastStatusCheck = new Date();

	// Update database
	if (Object.keys(updateData).length > 0) {
		await dbHttp
			.update(Workspaces)
			.set(updateData)
			.where(eq(Workspaces.id, workspace.id));
	}

	// TODO: Send email notification if charges were just enabled
	if (account.charges_enabled && !workspace.stripeConnectChargesEnabled) {
		console.log('TODO: Send onboarding complete email to workspace:', workspace.handle);
	}
}

export async function handleStripeConnectAccountDeauthorized(account: Stripe.Account) {
	console.log('🔌 Processing Connect account deauthorization:', account.id);

	// Find workspace by Stripe account ID
	const workspace = await dbHttp.query.Workspaces.findFirst({
		where: or(
			eq(Workspaces.stripeConnectAccountId, account.id),
			eq(Workspaces.stripeConnectAccountId_devMode, account.id),
		),
	});

	if (!workspace) {
		console.log('No workspace found for Stripe account:', account.id);
		return;
	}

	// Determine which fields to clear based on environment
	const isDevMode = workspace.stripeConnectAccountId_devMode === account.id;
	const updateData: Partial<typeof Workspaces.$inferInsert> = {};

	if (isDevMode) {
		updateData.stripeConnectAccountId_devMode = null;
		updateData.stripeConnectChargesEnabled_devMode = false;
	} else {
		updateData.stripeConnectAccountId = null;
		updateData.stripeConnectChargesEnabled = false;
	}

	// Update database
	await dbHttp.update(Workspaces).set(updateData).where(eq(Workspaces.id, workspace.id));

	console.log('✅ Stripe Connect disconnected for workspace:', workspace.handle);

	// TODO: Send email notification about disconnection
	console.log('TODO: Send disconnection notification to workspace:', workspace.handle);
}

export async function handleStripePaymentIntentSuccess(
	paymentIntent: Stripe.PaymentIntent,
) {
	console.log('💳 Processing payment intent:', paymentIntent.id);

	// Parse metadata to route to appropriate handler
	const metadata = paymentIntent.metadata;
	if (!metadata.paymentType) {
		console.log('No payment type in payment intent metadata');
		return;
	}

	// For now, we're primarily handling charge.succeeded
	// This is a backup/alternative event
	console.log('Payment intent succeeded with type:', metadata.paymentType);

	// Most of our logic is in charge.succeeded
	// This handler is here for completeness and future use
}

export async function handleStripePayoutFailed(payout: Stripe.Payout) {
	console.log('❌ Processing failed payout:', payout.id);

	// Find workspace by Stripe account ID (payout includes the account)
	const accountId =
		typeof payout.account === 'string' ? payout.account : payout.account?.id;
	if (!accountId) {
		console.error('No account ID in payout:', payout.id);
		return;
	}

	const workspace = await dbHttp.query.Workspaces.findFirst({
		where: or(
			eq(Workspaces.stripeConnectAccountId, accountId),
			eq(Workspaces.stripeConnectAccountId_devMode, accountId),
		),
	});

	if (!workspace) {
		console.log('No workspace found for Stripe account:', accountId);
		return;
	}

	console.error('Payout failed for workspace:', {
		workspace: workspace.handle,
		payoutId: payout.id,
		amount: payout.amount,
		failureCode: payout.failure_code,
		failureMessage: payout.failure_message,
	});

	// TODO: Send email notification about payout failure
	console.log('TODO: Send payout failure notification to workspace:', workspace.handle);
}

export async function verifyStripeConnectStatus(workspaceId: string) {
	console.log('🔍 Verifying Stripe Connect status for workspace:', workspaceId);

	const workspace = await dbHttp.query.Workspaces.findFirst({
		where: eq(Workspaces.id, workspaceId),
		columns: {
			id: true,
			handle: true,
			stripeConnectAccountId: true,
			stripeConnectAccountId_devMode: true,
			stripeConnectChargesEnabled: true,
			stripeConnectChargesEnabled_devMode: true,
		},
	});

	if (!workspace) {
		console.error('Workspace not found:', workspaceId);
		return false;
	}

	const stripeAccountId =
		isProduction() ?
			workspace.stripeConnectAccountId
		:	workspace.stripeConnectAccountId_devMode;

	if (!stripeAccountId) {
		console.log('No Stripe Connect account for workspace:', workspace.handle);
		return false;
	}

	try {
		// Retrieve account from Stripe
		const account = await stripe.accounts.retrieve(stripeAccountId);

		// Check current status from Stripe
		const chargesEnabled = account.charges_enabled;
		const detailsSubmitted = account.details_submitted;
		const payoutsEnabled = account.payouts_enabled;

		// Always update all status fields and timestamp
		const updateData: Partial<typeof Workspaces.$inferInsert> = {
			stripeConnectLastStatusCheck: new Date(),
		};

		if (isProduction()) {
			updateData.stripeConnectChargesEnabled = chargesEnabled;
			updateData.stripeConnectDetailsSubmitted = detailsSubmitted;
			updateData.stripeConnectPayoutsEnabled = payoutsEnabled;
		} else {
			updateData.stripeConnectChargesEnabled_devMode = chargesEnabled;
			updateData.stripeConnectDetailsSubmitted_devMode = detailsSubmitted;
			updateData.stripeConnectPayoutsEnabled_devMode = payoutsEnabled;
		}

		await dbHttp.update(Workspaces).set(updateData).where(eq(Workspaces.id, workspaceId));

		console.log(
			`✅ Verified Stripe Connect status for ${workspace.handle}: charges=${chargesEnabled}, details=${detailsSubmitted}, payouts=${payoutsEnabled}`,
		);

		return chargesEnabled;
	} catch (error) {
		console.error('Error verifying Stripe Connect status:', error);
		return false;
	}
}

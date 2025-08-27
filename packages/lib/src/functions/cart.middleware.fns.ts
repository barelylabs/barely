import type { InsertCart, stripeConnectChargeMetadataSchema } from '@barely/validators';
import type { z } from 'zod/v4';
import { dbHttp } from '@barely/db/client';
import { Carts } from '@barely/db/sql';
import { isProduction } from '@barely/utils';

import type { VisitorInfo } from '../middleware/request-parsing';
import type { ServerFunnel } from './cart.fns';
import { stripe } from '../integrations/stripe';
import { getProductsShippingRateEstimate } from './cart.fns';
import { getAmountsForCheckout, getFeeAmountForCheckout } from './cart.utils';

export async function createMainCartFromFunnel({
	funnel,
	visitor,
	shipTo,
	cartId,
}: {
	funnel: ServerFunnel;
	visitor: VisitorInfo | null;
	shipTo?: {
		country: string | null;
		state: string | null;
		city: string | null;
	};
	cartId: string;
}) {
	const stripeAccount =
		isProduction() ?
			funnel.workspace.stripeConnectAccountId
		:	funnel.workspace.stripeConnectAccountId_devMode;

	if (!stripeAccount) throw new Error('Stripe account not found');

	const amounts = getAmountsForCheckout(funnel, {
		mainProductQuantity: 1,
	});

	const metadata: z.infer<typeof stripeConnectChargeMetadataSchema> = {
		cartId,
		preChargeCartStage: 'checkoutCreated',
	};

	const paymentIntent = await stripe.paymentIntents.create(
		{
			amount: amounts.checkoutAmount,
			application_fee_amount: getFeeAmountForCheckout({
				amount: amounts.orderProductAmount,
				workspace: funnel.workspace,
			}),
			currency: 'usd',
			setup_future_usage: 'off_session',
			metadata,
		},
		{ stripeAccount, idempotencyKey: cartId },
	);

	if (!paymentIntent.client_secret) {
		throw new Error('stripe client_secret not found');
	}

	// create cart
	const cart: InsertCart = {
		id: cartId,
		workspaceId: funnel.workspace.id,
		cartFunnelId: funnel.id,
		stage: 'checkoutCreated',
		// visitor
		...visitor,
		visitorGeo: visitor?.geo,
		visitorUserAgent: visitor?.userAgent,
		// stripe
		checkoutStripePaymentIntentId: paymentIntent.id,
		checkoutStripeClientSecret: paymentIntent.client_secret,
		// main product
		mainProductQuantity: 1,
		mainProductId: funnel.mainProduct.id, // bump product
		bumpProductId: funnel.bumpProduct?.id ?? null,
		upsellProductId: funnel.upsellProduct?.id ?? null,
		// marketing
		emailMarketingOptIn: true,
		// amounts
		...amounts,
	};

	if (shipTo?.country && shipTo.state && shipTo.city) {
		const { lowestShippingPrice: mainShippingAmount } =
			await getProductsShippingRateEstimate({
				products: [{ product: funnel.mainProduct, quantity: 1 }],
				shipFrom: {
					postalCode: funnel.workspace.shippingAddressPostalCode ?? '',
					countryCode: funnel.workspace.shippingAddressCountry ?? '',
				},
				shipTo: {
					country: shipTo.country,
					state: shipTo.state,
					city: shipTo.city,
				},
			});

		cart.mainShippingAmount = mainShippingAmount;

		const mainPlusBumpShippingPrice =
			!funnel.bumpProduct ? mainShippingAmount : (
				await getProductsShippingRateEstimate({
					products: [
						{ product: funnel.mainProduct, quantity: 1 },
						{ product: funnel.bumpProduct, quantity: 1 },
					],
					shipFrom: {
						postalCode: funnel.workspace.shippingAddressPostalCode ?? '',
						countryCode: funnel.workspace.shippingAddressCountry ?? '',
					},
					shipTo: {
						country: shipTo.country,
						state: shipTo.state,
						city: shipTo.city,
					},
				}).then(rates => rates.lowestShippingPrice)
			);

		cart.bumpShippingPrice = mainPlusBumpShippingPrice - mainShippingAmount;
	}

	await dbHttp.insert(Carts).values(cart);

	return cart;
}

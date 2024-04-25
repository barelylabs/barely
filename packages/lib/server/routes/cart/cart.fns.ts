import type { ReceiptEmailProps } from '@barely/email/src/templates/cart/receipt';
import type { z } from 'zod';
import { sendEmail } from '@barely/email';
import ReceiptEmailTemplate from '@barely/email/src/templates/cart/receipt';
import { and, eq, lt } from 'drizzle-orm';

import type { ShippingEstimateProps } from '../../shipengine/shipengine.endpts';
import type { Fan } from '../fan/fan.schema';
import type { Product } from '../product/product.schema';
import type { stripeConnectChargeMetadataSchema } from '../stripe-connect/stripe-connect.schema';
import type { Cart, InsertCart, UpdateCart } from './cart.schema';
import { formatCentsToDollars } from '../../../utils/currency';
import { isProduction } from '../../../utils/environment';
import { newId } from '../../../utils/id';
import { numToPaddedString } from '../../../utils/number';
import { raise } from '../../../utils/raise';
import { db } from '../../db';
import { getShippingEstimates } from '../../shipengine/shipengine.endpts';
import { stripe } from '../../stripe';
import { CartFunnels } from '../cart-funnel/cart-funnel.sql';
import { MEDIAMAIL_TYPES, MERCH_DIMENSIONS } from '../product/product.constants';
import { getPublicWorkspaceFromWorkspace } from '../workspace/workspace.schema';
import { Carts } from './cart.sql';
import { getAmountsForCheckout } from './cart.utils';

/* get funnel */
export const funnelWith = {
	workspace: true,
	mainProduct: {
		with: {
			_images: {
				with: {
					file: true,
				},
			},
		},
	},
	bumpProduct: {
		with: {
			_images: {
				with: {
					file: true,
				},
			},
			_apparelSizes: true,
		},
	},
	upsellProduct: {
		with: {
			_images: {
				with: {
					file: true,
				},
			},
			_apparelSizes: true,
		},
	},
} as const;

export async function getFunnelByParams(handle: string, funnelKey: string) {
	const funnel = await db.pool.query.CartFunnels.findFirst({
		where: and(eq(CartFunnels.handle, handle), eq(CartFunnels.key, funnelKey)),
		with: funnelWith,
	});

	if (!funnel) return null;

	return funnel;
}

export type ServerFunnel = NonNullable<Awaited<ReturnType<typeof getFunnelByParams>>>;

export function getPublicFunnelFromServerFunnel(funnel: ServerFunnel) {
	return {
		...funnel,
		workspace: getPublicWorkspaceFromWorkspace(funnel.workspace),
	};
}

export type PublicFunnel = ReturnType<typeof getPublicFunnelFromServerFunnel>;

/* create cart */
export async function createMainCartFromFunnel(
	funnel: ServerFunnel,
	shipTo?: {
		country: string | null;
		state: string | null;
		city: string | null;
	},
) {
	const stripeAccount =
		isProduction() ?
			funnel.workspace.stripeConnectAccountId
		:	funnel.workspace.stripeConnectAccountId_devMode;

	if (!stripeAccount) throw new Error('Stripe account not found');

	const cartId = newId('cart');

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
		// stripe
		checkoutStripePaymentIntentId: paymentIntent.id,
		checkoutStripeClientSecret: paymentIntent.client_secret,
		// main product
		mainProductId: funnel.mainProduct.id, // bump product
		bumpProductId: funnel.bumpProduct?.id ?? null,
		marketingOptIn: true,
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

	await db.pool.insert(Carts).values(cart);

	return cart;
}

/* get cart */
export async function getCartById(id: string, handle?: string, funnelKey?: string) {
	const cart = await db.pool.query.Carts.findFirst({
		where: eq(Carts.id, id),
		with: {
			fan: true,
			funnel: { with: funnelWith },
			workspace: true,
		},
	});

	if (!cart) return null;
	if (handle && cart.workspace.handle !== handle) return null;
	if (funnelKey && cart.funnel?.key !== funnelKey) return null;

	return cart;
}

/* shipping */
export async function getProductsShippingRateEstimate(props: {
	products: { product: Product; quantity: number }[];
	shipFrom: ShippingEstimateProps['shipFrom'];
	shipTo: ShippingEstimateProps['shipTo'];
}) {
	const { shipFrom, shipTo, products } = props;
	// estimate dimensions and weight based on product types
	let totalWeightInOunces = 0;
	let totalVolume = 0;
	let minWidth = 0;
	let minLength = 0;
	let minHeight = 0;

	products.forEach(({ product, quantity }) => {
		const dimensions = MERCH_DIMENSIONS[product.merchType];
		totalWeightInOunces += dimensions.weight * quantity;
		// simple volume calculation
		totalVolume += dimensions.width * dimensions.length * dimensions.height * quantity;
		// get the largest dimensions
		minWidth = Math.max(minWidth, dimensions.width);
		minLength = Math.max(minLength, dimensions.length);
		minHeight = Math.max(minHeight, dimensions.height);
	});

	// get the smallest box that can fit all the products
	const boxWidth = Math.ceil(minWidth);
	const boxLength = Math.ceil(minLength);
	const boxHeight = Math.ceil(Math.max(totalVolume / (boxWidth * boxLength), minHeight));

	const eligibleForMediaMail = products.every(p =>
		MEDIAMAIL_TYPES.includes(p.product.merchType),
	);

	console.log('eligibleForMediaMail', eligibleForMediaMail);

	const rates = await getShippingEstimates({
		shipFrom,
		shipTo,
		package: {
			weightInOunces: totalWeightInOunces,
			lengthInInches: boxLength,
			widthInInches: boxWidth,
			heightInInches: boxHeight,
		},
		eligibleForMediaMail,
	});

	return {
		rates,
		lowestShippingPrice: rates[0]?.shipping_amount.amount ?? 0,
	};
}

/* email updates */
interface ReceiptCart extends Cart {
	mainProduct: Product;
	bumpProduct: Product | null;
	upsellProduct: Product | null;
	fan: Fan;
	funnel: ServerFunnel;
}

export async function sendCartReceiptEmail(cart: ReceiptCart) {
	const products: ReceiptEmailProps['products'] = [
		// main product
		{
			name: cart.mainProduct.name,
			price: formatCentsToDollars(cart.mainProductAmount),
			shipping: formatCentsToDollars(cart.mainShippingAndHandlingAmount ?? 0),
			payWhatYouWantPrice:
				cart.funnel.mainProductPayWhatYouWant ?
					formatCentsToDollars(cart.mainProductPayWhatYouWantPrice ?? 0)
				:	undefined,
		},

		// bump product
		...(cart.bumpProduct && cart.addedBump ?
			[
				{
					name: cart.bumpProduct.name,
					price: formatCentsToDollars(cart.bumpProductAmount ?? 0),
					shipping: formatCentsToDollars(cart.bumpShippingAndHandlingAmount ?? 0),
				},
			]
		:	[]),

		// upsell product
		...(cart.upsellProduct && cart.stage === 'upsellConverted' ?
			[
				{
					name: cart.upsellProduct.name,
					price: formatCentsToDollars(cart.upsellProductAmount ?? 0),
					shipping: formatCentsToDollars(cart.upsellShippingAndHandlingAmount ?? 0),
				},
			]
		:	[]),
	];

	const orderId = numToPaddedString(cart.orderId ?? raise('orderId not found'), {
		digits: 4,
	});

	const ReceiptEmail = ReceiptEmailTemplate({
		orderId,
		date: cart.checkoutConvertedAt ?? new Date(),
		sellerName: cart.funnel.workspace.name,
		billingAddress: {
			name: cart.fan.fullName,
			postalCode: cart.fan.billingAddressPostalCode,
			country: cart.fan.billingAddressCountry,
		},
		supportEmail:
			cart.funnel.workspace.cartSupportEmail ?? raise('cartSupportEmail not found'),
		shippingAddress: {
			name: cart.fan.fullName,
			line1: cart.shippingAddressLine1,
			line2: cart.shippingAddressLine2,
			city: cart.shippingAddressCity,
			state: cart.shippingAddressState,
			postalCode: cart.shippingAddressPostalCode,
			country: cart.shippingAddressCountry,
		},
		products,
		shippingTotal: formatCentsToDollars(cart.orderShippingAndHandlingAmount ?? 0),
		total: formatCentsToDollars(cart.orderAmount),
	});

	await sendEmail({
		from: 'receipts@barelycart.email',
		to: cart.fan.email,
		bcc: cart.funnel.workspace.cartSupportEmail ?? undefined,
		subject: `${cart.funnel.workspace.name}: Invoice ${orderId}`,
		type: 'transactional',
		react: ReceiptEmail,
	});
}

/* cron */
export async function checkForAbandonedUpsellCarts() {
	const carts = await db.pool.query.Carts.findMany({
		with: {
			funnel: { with: funnelWith },
			fan: true,
		},
		where: and(
			eq(Carts.stage, 'upsellCreated'),
			eq(Carts.orderReceiptSent, false),
			lt(Carts.checkoutConvertedAt, new Date(Date.now() - 5 * 60 * 1000)), // upsells created more than 5 minutes ago
		),
	});

	await Promise.allSettled(
		carts.map(async cart => {
			const updateCartData: UpdateCart = {
				id: cart.id,
				stage: 'upsellAbandoned',
			};

			if (cart.email && cart.funnel && cart.fan) {
				await sendCartReceiptEmail({
					...cart,
					fan: cart.fan,
					funnel: cart.funnel,
					mainProduct: cart.funnel.mainProduct,
					bumpProduct: cart.funnel.bumpProduct,
					upsellProduct: cart.funnel.upsellProduct,
				});
				updateCartData.orderReceiptSent = true;
			}

			// todo: trigger any automations (e.g. mailchimp, zapier, etc.)

			return await db.pool.update(Carts).set(updateCartData).where(eq(Carts.id, cart.id));
		}),
	);
}

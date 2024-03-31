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
import { raise } from '../../../utils/raise';
import { db } from '../../db';
import { getShippingEstimates } from '../../shipengine/shipengine.endpts';
import { stripe } from '../../stripe';
import { CartFunnels } from '../cart-funnel/cart-funnel.sql';
import { MEDIAMAIL_TYPES, MERCH_DIMENSIONS } from '../product/product.constants';
import { Carts } from './cart.sql';
import { getAmountsForMainCart } from './cart.utils';

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

export async function getPublicFunnelByHandleAndKey(handle: string, funnelKey: string) {
	const funnel = await db.pool.query.CartFunnels.findFirst({
		where: and(eq(CartFunnels.handle, handle), eq(CartFunnels.key, funnelKey)),
		with: funnelWith,
	});

	if (!funnel) return null;
	return funnel;
}

export type PublicFunnel = NonNullable<
	Awaited<ReturnType<typeof getPublicFunnelByHandleAndKey>>
>;

/* create cart */
export async function createMainCartFromFunnel(
	funnel: PublicFunnel,
	shipTo?: {
		country: string | null;
		state: string | null;
		city: string | null;
	},
) {
	const stripeAccount = isProduction()
		? funnel.workspace.stripeConnectAccountId
		: funnel.workspace.stripeConnectAccountId_devMode;

	if (!stripeAccount) throw new Error('Stripe account not found');

	const cartId = newId('cart');

	const amounts = getAmountsForMainCart(funnel, {
		mainProductQuantity: 1,
	});

	const metadata: z.infer<typeof stripeConnectChargeMetadataSchema> = {
		cartId,
		preChargeCartStage: 'mainCreated',
	};

	const paymentIntent = await stripe.paymentIntents.create(
		{
			amount: amounts.mainPlusBumpAmount,
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
		funnelId: funnel.id,
		stage: 'mainCreated',
		// stripe
		mainStripePaymentIntentId: paymentIntent.id,
		mainStripeClientSecret: paymentIntent.client_secret,
		// main product
		mainProductId: funnel.mainProduct.id, // bump product
		bumpProductId: funnel.bumpProduct?.id ?? null,
		marketingOptIn: true,
		...amounts,
	};

	if (shipTo?.country && shipTo.state && shipTo.city) {
		const mainProductShippingRate = await getProductsShippingRateEstimate({
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
		const mainProductShippingAmount =
			mainProductShippingRate?.shipping_amount.amount ?? 1000;
		cart.mainProductShippingAmount = mainProductShippingAmount;

		const mainPlusBumpShippingRate = !funnel.bumpProduct
			? mainProductShippingRate
			: await getProductsShippingRateEstimate({
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
				});

		if (mainPlusBumpShippingRate) {
			cart.bumpProductShippingPrice = mainPlusBumpShippingRate.shipping_amount.amount;
			-mainProductShippingAmount;
		}
	}

	await db.pool.insert(Carts).values(cart);

	return cart;
}

/* get cart */
export async function getCartById(id: string) {
	const cart = await db.pool.query.Carts.findFirst({
		where: eq(Carts.id, id),
		with: {
			fan: true,
			funnel: { with: funnelWith },
			workspace: true,
		},
	});

	if (!cart) return null;
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

	return rates[0] ?? null;
}

/* email updates */
interface ReceiptCart extends Cart {
	mainProduct: Product;
	bumpProduct: Product | null;
	upsellProduct: Product | null;
	fan: Fan;
	funnel: PublicFunnel;
}

export async function sendCartReceiptEmail(cart: ReceiptCart) {
	const mainCartAmounts = getAmountsForMainCart(cart.funnel, cart);

	const shipping = cart.shippingAndHandlingAmount ?? 0;

	const products: ReceiptEmailProps['products'] = [
		// main product
		{
			name: cart.mainProduct.name,
			price: formatCentsToDollars(cart.mainProductPrice),
			shipping: formatCentsToDollars(
				mainCartAmounts.mainProductShippingAmount +
					mainCartAmounts.mainProductHandlingAmount,
			),
			payWhatYouWantPrice: cart.funnel.mainProductPayWhatYouWant
				? formatCentsToDollars(mainCartAmounts.mainProductPayWhatYouWantPrice)
				: undefined,
		},

		// bump product
		...(cart.bumpProduct && cart.addedBumpProduct
			? [
					{
						name: cart.bumpProduct.name,
						price: formatCentsToDollars(mainCartAmounts.bumpProductAmount),
						shipping: formatCentsToDollars(mainCartAmounts.bumpProductShippingPrice),
					},
				]
			: []),

		...(cart.upsellProduct && cart.stage === 'upsellConverted'
			? [
					{
						name: cart.upsellProduct.name,
						price: formatCentsToDollars(cart.upsellProductAmount ?? 0),
						shipping: formatCentsToDollars(cart.upsellProductShippingPrice ?? 0),
					},
				]
			: []),
	];

	const ReceiptEmail = ReceiptEmailTemplate({
		cartId: cart.id,
		date: cart.upsellCreatedAt ?? new Date(),
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
		shippingTotal: formatCentsToDollars(shipping),
		total: formatCentsToDollars(cart.amount),
	});

	console.log(
		'about to send cart receipt email',
		cart.fan.email,
		cart.funnel.workspace.cartSupportEmail,
	);
	await sendEmail({
		from: 'receipts@barelycart.email',
		to: cart.fan.email,
		bcc: cart.funnel.workspace.cartSupportEmail ?? undefined,
		subject: `${cart.funnel.workspace.name}: Invoice ${cart.id}`,
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
			eq(Carts.receiptSent, false),
			lt(Carts.upsellCreatedAt, new Date(Date.now() - 5 * 60 * 1000)), // upsells created more than 5 minutes ago
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
				updateCartData.receiptSent = true;
			}

			// todo: trigger any automations (e.g. mailchimp, zapier, etc.)

			return await db.pool.update(Carts).set(updateCartData).where(eq(Carts.id, cart.id));
		}),
	);
}

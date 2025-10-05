import 'server-only'; // <-- ensure this file cannot be imported from the client

import type { ReceiptEmailProps } from '@barely/email/templates/cart';
import type {
	Cart,
	Fan,
	InsertCart,
	Product,
	stripeConnectChargeMetadataSchema,
} from '@barely/validators/schemas';
import type { z } from 'zod/v4';
import { APPAREL_TYPES, MEDIAMAIL_TYPES, MERCH_DIMENSIONS } from '@barely/const';
import { dbHttp } from '@barely/db/client';
import {
	CartFunnels,
	Carts,
	EmailBroadcasts,
	EmailTemplates,
	FlowActions,
	LandingPages,
} from '@barely/db/sql';
import { sqlIncrement } from '@barely/db/utils';
import { sendEmail } from '@barely/email';
import { ReceiptEmailTemplate } from '@barely/email/templates/cart';
import {
	formatMinorToMajorCurrency,
	isProduction,
	numToPaddedString,
	raise,
} from '@barely/utils';
import { getPublicWorkspaceFromWorkspace } from '@barely/validators/schemas';
import { and, count, eq, isNotNull } from 'drizzle-orm';

import type { ShippingEstimateProps } from '../integrations/shipping/easy-post';
// import type { ShippingEstimateProps } from '../integrations/shipping/shipengine.endpts';
import type { VisitorInfo } from '../middleware/request-parsing';
import { getShipStationRateEstimates } from '../integrations/shipping/shipengine.endpts';
// import { getShippingEstimates } from '../integrations/shipping/shipengine.endpts';
import { stripe } from '../integrations/stripe';
import {
	getAmountsForCheckout,
	getFeeAmountForCheckout,
	getVatRateForCheckout,
} from '../utils/cart';

/* get funnel */
export const funnelWith = {
	workspace: {
		columns: {
			id: true,
			name: true,
			handle: true,
			type: true,

			brandHue: true, // deprecated
			brandAccentHue: true, // deprecated
			bio: true,
			bookingTitle: true,
			bookingName: true,
			bookingEmail: true,
			spotifyArtistId: true,
			youtubeChannelId: true,
			tiktokUsername: true,
			instagramUsername: true,
			spotifyFollowers: true,
			spotifyMonthlyListeners: true,
			youtubeSubscribers: true,
			tiktokFollowers: true,
			instagramFollowers: true,
			twitterFollowers: true,
			facebookFollowers: true,

			plan: true,
			cartFeePercentageOverride: true,
			cartSupportEmail: true,
			shippingAddressPostalCode: true,
			shippingAddressState: true,
			shippingAddressCountry: true,
			stripeConnectAccountId: true,
			stripeConnectAccountId_devMode: true,
			currency: true,
		},
	},
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

type FunnelWith = typeof funnelWith;

export async function getFunnelByParams(handle: string, key: string) {
	const funnel = await dbHttp.query.CartFunnels.findFirst({
		where: and(eq(CartFunnels.handle, handle), eq(CartFunnels.key, key)),
		with: {
			workspace: {
				columns: {
					id: true,
					name: true,
					handle: true,
					type: true,
					brandHue: true,
					brandAccentHue: true,
					bio: true,
					bookingTitle: true,
					bookingName: true,
					bookingEmail: true,
					spotifyArtistId: true,
					youtubeChannelId: true,
					tiktokUsername: true,
					instagramUsername: true,
					spotifyFollowers: true,
					spotifyMonthlyListeners: true,
					youtubeSubscribers: true,
					tiktokFollowers: true,
					instagramFollowers: true,
					twitterFollowers: true,
					facebookFollowers: true,

					plan: true,
					cartFeePercentageOverride: true,
					cartSupportEmail: true,
					shippingAddressPostalCode: true,
					shippingAddressState: true,
					shippingAddressCountry: true,
					stripeConnectAccountId: true,
					stripeConnectAccountId_devMode: true,
					currency: true,
				},
			},
			// key: true,
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
		} satisfies FunnelWith,
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

/* get funnel without workspace - lightweight query for performance */
export async function getFunnelWithoutWorkspace(handle: string, key: string) {
	const funnel = await dbHttp.query.CartFunnels.findFirst({
		where: and(eq(CartFunnels.handle, handle), eq(CartFunnels.key, key)),
		with: {
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
		},
	});

	return funnel;
}

export type FunnelWithoutWorkspace = Awaited<
	ReturnType<typeof getFunnelWithoutWorkspace>
>;

/* create cart */
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
	console.log('creating cart from funnel', funnel.workspace.name);
	const stripeAccount =
		isProduction() ?
			funnel.workspace.stripeConnectAccountId
		:	funnel.workspace.stripeConnectAccountId_devMode;

	if (!stripeAccount) throw new Error('Stripe account not found');
	const vat = getVatRateForCheckout(
		funnel.workspace.shippingAddressCountry,
		shipTo?.country ?? '',
	);
	const amounts = getAmountsForCheckout(
		funnel,
		{
			mainProductQuantity: 1,
		},
		vat,
	);

	const metadata: z.infer<typeof stripeConnectChargeMetadataSchema> = {
		paymentType: 'cart',
		cartId,
		preChargeCartStage: 'checkoutCreated',
	};

	const paymentIntent = await stripe.paymentIntents.create(
		{
			amount: amounts.checkoutAmount,
			application_fee_amount: getFeeAmountForCheckout({
				productAmount: amounts.orderProductAmount, // we just take fees on product sales, not shipping or tax
				vatAmount: amounts.orderVatAmount,
				shippingAndHandlingAmount: 0, // not supported yet. in the future we take a shipping fee if they want to ship through the app.
				workspace: funnel.workspace,
			}),
			currency: funnel.workspace.currency,
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
					state: funnel.workspace.shippingAddressState ?? '',
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
						state: funnel.workspace.shippingAddressState ?? '',
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

/* get cart */
export async function getCartById(id: string, handle?: string, funnelKey?: string) {
	const cart = await dbHttp.query.Carts.findFirst({
		where: eq(Carts.id, id),
		with: {
			fan: true,
			funnel: { with: funnelWith },
			workspace: true,
		},
	});

	if (!cart) return null;
	if (!cart.funnel) return null;
	if (handle && cart.workspace.handle !== handle) return null;
	if (funnelKey && cart.funnel.key !== funnelKey) return null;

	return cart;
}

/* shipping */
export async function getProductsShippingRateEstimate(props: {
	products: { product: Product; quantity: number }[];
	shipFrom: ShippingEstimateProps['shipFrom'];
	shipTo: ShippingEstimateProps['shipTo'];
}) {
	console.log('getProductsShippingRateEstimate >>>', props);
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

	const rates = await getShipStationRateEstimates({
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
	currency: 'usd' | 'gbp';
}

export async function sendCartReceiptEmail(cart: ReceiptCart) {
	const products: ReceiptEmailProps['products'] = [
		// main product
		{
			name: cart.mainProduct.name,
			price: formatMinorToMajorCurrency(cart.mainProductAmount, cart.currency),
			shipping: formatMinorToMajorCurrency(
				cart.mainShippingAndHandlingAmount ?? 0,
				cart.currency,
			),
			payWhatYouWantPrice:
				cart.funnel.mainProductPayWhatYouWant ?
					formatMinorToMajorCurrency(
						cart.mainProductPayWhatYouWantPrice ?? 0,
						cart.currency,
					)
				:	undefined,
			size:
				(
					cart.mainProductApparelSize &&
					APPAREL_TYPES.some(type => type === cart.mainProduct.merchType)
				) ?
					cart.mainProductApparelSize
				:	undefined,
		},

		// bump product
		...(cart.bumpProduct && cart.addedBump ?
			[
				{
					name: cart.bumpProduct.name,
					price: formatMinorToMajorCurrency(cart.bumpProductAmount ?? 0, cart.currency),
					shipping: formatMinorToMajorCurrency(
						cart.bumpShippingAndHandlingAmount ?? 0,
						cart.currency,
					),
					size:
						(
							cart.bumpProductApparelSize &&
							APPAREL_TYPES.some(type => type === cart.bumpProduct.merchType)
						) ?
							cart.bumpProductApparelSize
						:	undefined,
				},
			]
		:	[]),

		// upsell product
		...(cart.upsellProduct && cart.stage === 'upsellConverted' ?
			[
				{
					name: cart.upsellProduct.name,
					price: formatMinorToMajorCurrency(cart.upsellProductAmount ?? 0, cart.currency),
					shipping: formatMinorToMajorCurrency(
						cart.upsellShippingAndHandlingAmount ?? 0,
						cart.currency,
					),
					size:
						(
							cart.upsellProductApparelSize &&
							APPAREL_TYPES.some(type => type === cart.upsellProduct.merchType)
						) ?
							cart.upsellProductApparelSize
						:	undefined,
				},
			]
		:	[]),
	];

	const orderId = numToPaddedString(await getOrCreateCartOrderId(cart), {
		digits: 6,
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
		shippingTotal: formatMinorToMajorCurrency(
			cart.orderShippingAndHandlingAmount ?? 0,
			cart.currency,
		),
		vatTotal: formatMinorToMajorCurrency(cart.orderVatAmount ?? 0, cart.currency),
		total: formatMinorToMajorCurrency(cart.orderAmount, cart.currency),
	});

	await sendEmail({
		from: 'orders@barelycart.email',
		fromFriendlyName: cart.funnel.workspace.name,
		to: cart.fan.email,
		bcc: ['adam@barely.ai', cart.funnel.workspace.cartSupportEmail ?? ''].filter(
			s => s.length > 0,
		),
		subject: `${cart.funnel.workspace.name}: Invoice ${orderId}`,
		type: 'transactional',
		react: ReceiptEmail,
	});
}

export async function createOrderIdForCart(cart: Cart) {
	const ordersCount = await dbHttp
		.select({ count: count() })
		.from(Carts)
		.where(and(eq(Carts.workspaceId, cart.workspaceId), isNotNull(Carts.orderId)))
		.then(r => r[0]?.count ?? raise('count not found'));

	const orderId = ordersCount + 1;

	return orderId;
}

export async function getOrCreateCartOrderId(cart: Cart) {
	if (cart.orderId) return cart.orderId;

	const ordersCount = await dbHttp
		.select({ count: count() })
		.from(Carts)
		.where(and(eq(Carts.workspaceId, cart.workspaceId), isNotNull(Carts.orderId)))
		.then(r => r[0]?.count ?? raise('count not found'));

	const orderId = ordersCount + 1;
	await dbHttp
		.update(Carts)
		.set({
			orderId,
		})
		.where(eq(Carts.id, cart.id));

	return orderId;
}

/* increment value */
export async function incrementAssetValuesOnCartPurchase(
	cart: Cart,
	incrementAmountInCents: number,
) {
	if (cart.emailTemplateId) {
		await dbHttp
			.update(EmailTemplates)
			.set({
				value: sqlIncrement(EmailTemplates.value, incrementAmountInCents),
			})
			.where(eq(EmailTemplates.id, cart.emailTemplateId));
	}
	if (cart.emailBroadcastId) {
		await dbHttp
			.update(EmailBroadcasts)
			.set({
				value: sqlIncrement(EmailBroadcasts.value, incrementAmountInCents),
			})
			.where(eq(EmailBroadcasts.id, cart.emailBroadcastId));
	}
	if (cart.flowActionId) {
		await dbHttp
			.update(FlowActions)
			.set({
				value: sqlIncrement(FlowActions.value, incrementAmountInCents),
			})
			.where(eq(FlowActions.id, cart.flowActionId));
	}

	if (cart.landingPageId) {
		await dbHttp
			.update(LandingPages)
			.set({
				value: sqlIncrement(LandingPages.value, incrementAmountInCents),
			})
			.where(eq(LandingPages.id, cart.landingPageId));
	}
	if (cart.cartFunnelId) {
		await dbHttp
			.update(CartFunnels)
			.set({
				value: sqlIncrement(CartFunnels.value, incrementAmountInCents),
			})
			.where(eq(CartFunnels.id, cart.cartFunnelId));
	}
}

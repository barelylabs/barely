import { TRPCError } from '@trpc/server';
import { and, eq, notInArray } from 'drizzle-orm';
import { z } from 'zod';

import type { UpdateCart } from './cart.schema';
import { isProduction } from '../../../utils/environment';
import { raise } from '../../../utils/raise';
import { getAbsoluteUrl } from '../../../utils/url';
import { wait } from '../../../utils/wait';
import { createTRPCRouter, publicProcedure } from '../../api/trpc';
import { stripe } from '../../stripe';
import { CartFunnels } from '../cart-funnel/cart-funnel.sql';
import { eventReportSearchParamsSchema } from '../event/event-report.schema';
import { recordCartEvent } from '../event/event.fns';
import { WEB_EVENT_TYPES__CART } from '../event/event.tb';
import { Files } from '../file/file.sql';
import { APPAREL_SIZES } from '../product/product.constants';
import { getStripeConnectAccountId } from '../stripe-connect/stripe-connect.fns';
import {
	createMainCartFromFunnel,
	funnelWith,
	getCartById,
	getFunnelByParams,
	getProductsShippingRateEstimate,
	getPublicFunnelFromServerFunnel,
	incrementAssetValuesOnCartPurchase,
	sendCartReceiptEmail,
} from './cart.fns';
import { updateCheckoutCartFromCheckoutSchema } from './cart.schema';
import { Carts } from './cart.sql';
import { getAmountsForCheckout, getFeeAmountForCheckout } from './cart.utils';

export const cartRouter = createTRPCRouter({
	create: publicProcedure
		.input(
			z.object({
				handle: z.string(),
				key: z.string(),
				shipTo: z
					.object({
						country: z.string().nullable(),
						state: z.string().nullable(),
						city: z.string().nullable(),
					})
					.optional(),
				// tracking
				tracking: eventReportSearchParamsSchema,
			}),
		)
		.mutation(async ({ input }) => {
			const { handle, key, ...cartParams } = input;
			const funnel = await getFunnelByParams(handle, key);

			if (!funnel) throw new Error('funnel not found');

			const cart = await createMainCartFromFunnel({ funnel, ...cartParams });

			return {
				cart,
				publicFunnel: getPublicFunnelFromServerFunnel(funnel),
			};
		}),

	byIdAndParams: publicProcedure
		.input(z.object({ id: z.string(), handle: z.string(), key: z.string() }))
		.query(async ({ input, ctx }) => {
			const funnel = await ctx.db.pool.query.CartFunnels.findFirst({
				where: and(eq(CartFunnels.handle, input.handle), eq(CartFunnels.key, input.key)),
				with: {
					...funnelWith,
					_carts: {
						where: eq(Carts.id, input.id),
						limit: 1,
					},
				},
			});

			if (!funnel) throw new Error('funnel not found');

			// check if product images have blurDataURLs. if not, generate them
			if (
				!funnel.mainProduct?._images[0]?.file.blurDataUrl &&
				funnel.mainProduct?._images[0]?.file.s3Key
			) {
				const { getBlurHash } = await import('../file/file.blurhash');
				const { blurHash, blurDataUrl } = await getBlurHash(
					funnel.mainProduct?._images[0]?.file.s3Key,
				);

				await ctx.db.pool
					.update(Files)
					.set({ blurHash, blurDataUrl })
					.where(eq(Files.id, funnel.mainProduct?._images[0]?.file.id));
			}

			if (
				!funnel.bumpProduct?._images[0]?.file.blurDataUrl &&
				funnel.bumpProduct?._images[0]?.file.s3Key
			) {
				const { getBlurHash } = await import('../file/file.blurhash');
				const { blurHash, blurDataUrl } = await getBlurHash(
					funnel.bumpProduct?._images[0]?.file.s3Key,
				);

				await ctx.db.pool
					.update(Files)
					.set({ blurHash, blurDataUrl })
					.where(eq(Files.id, funnel.bumpProduct?._images[0]?.file.id));
			}

			if (
				!funnel.upsellProduct?._images[0]?.file.blurDataUrl &&
				funnel.upsellProduct?._images[0]?.file.s3Key
			) {
				const { getBlurHash } = await import('../file/file.blurhash');
				const { blurHash, blurDataUrl } = await getBlurHash(
					funnel.upsellProduct?._images[0]?.file.s3Key,
				);

				await ctx.db.pool
					.update(Files)
					.set({ blurHash, blurDataUrl })
					.where(eq(Files.id, funnel.upsellProduct?._images[0]?.file.id));
			}

			const cart = funnel._carts[0] ?? (await createMainCartFromFunnel({ funnel }));

			return {
				cart,
				publicFunnel: getPublicFunnelFromServerFunnel(funnel),
			};
		}),

	updateCheckoutFromCheckout: publicProcedure
		.input(updateCheckoutCartFromCheckoutSchema)
		.mutation(async ({ input, ctx }) => {
			const { id, handle, key, ...update } = input;

			const cart = await getCartById(id, handle, key);
			if (!cart) throw new TRPCError({ code: 'NOT_FOUND', message: 'Cart not found' });

			const { funnel } = cart;
			if (!funnel) throw new Error('funnel not found');

			const updateCart: UpdateCart = {
				id: cart.id,
				...update,
			};

			if (update.shippingAddressPostalCode) {
				const toCountry = update.shippingAddressCountry ?? cart.shippingAddressCountry;
				const toState = update.shippingAddressState ?? cart.shippingAddressState;
				const toCity = update.shippingAddressCity ?? cart.shippingAddressCity;
				const toPostalCode =
					update.shippingAddressPostalCode ?? cart.shippingAddressPostalCode;

				if (
					toCountry &&
					toState &&
					toCity &&
					toPostalCode &&
					toPostalCode !== cart.shippingAddressPostalCode
				) {
					const { lowestShippingPrice: mainShippingAmount } =
						await getProductsShippingRateEstimate({
							products: [
								{ product: funnel.mainProduct, quantity: cart.mainProductQuantity ?? 1 },
							],
							shipFrom: {
								postalCode: funnel.workspace.shippingAddressPostalCode ?? '',
								countryCode: funnel.workspace.shippingAddressCountry ?? '',
							},
							shipTo: {
								country: toCountry,
								state: toState,
								city: toCity,
								postalCode: toPostalCode,
							},
						});

					updateCart.mainShippingAmount = mainShippingAmount;

					const mainPlusBumpShippingPrice =
						!funnel.bumpProduct ? mainShippingAmount : (
							await getProductsShippingRateEstimate({
								products: [
									{
										product: funnel.mainProduct,
										quantity: cart.mainProductQuantity ?? 1,
									},
									{
										product: funnel.bumpProduct,
										quantity: cart.bumpProductQuantity ?? 1,
									},
								],
								shipFrom: {
									postalCode: funnel.workspace.shippingAddressPostalCode ?? '',
									countryCode: funnel.workspace.shippingAddressCountry ?? '',
								},
								shipTo: {
									postalCode: toPostalCode,
									country: toCountry,
									state: toState,
									city: toCity,
								},
							}).then(({ lowestShippingPrice }) => lowestShippingPrice)
						);

					updateCart.bumpShippingPrice = mainPlusBumpShippingPrice - mainShippingAmount;
				}
			}

			const amounts = getAmountsForCheckout(funnel, {
				...cart,
				...updateCart,
			});
			// console.log('updated amounts', amounts);

			const carts = await ctx.db.pool
				.update(Carts)
				.set({
					...update,
					...amounts,
				})
				.where(
					and(
						eq(Carts.id, id),
						notInArray(Carts.stage, ['checkoutConverted', 'upsellConverted']),
					),
				)
				.returning();

			const stripePaymentIntentId = carts[0]?.checkoutStripePaymentIntentId;
			if (!stripePaymentIntentId) throw new Error('stripePaymentIntentId not found');

			const stripeAccount =
				isProduction() ?
					funnel.workspace.stripeConnectAccountId
				:	funnel.workspace.stripeConnectAccountId_devMode;

			// we need to update the paymentIntent amount
			await stripe.paymentIntents.update(
				stripePaymentIntentId,
				{
					amount: amounts.orderAmount,
					application_fee_amount: getFeeAmountForCheckout({
						amount: amounts.orderProductAmount,
						workspace: funnel.workspace,
					}),
				},
				{ stripeAccount: stripeAccount ?? raise('stripeAccount not found') },
			);

			return {
				cart: carts[0],
			};
		}),

	buyUpsell: publicProcedure
		.input(
			z.object({
				cartId: z.string(),
				apparelSize: z.enum(APPAREL_SIZES).optional(),
				upsellIndex: z.number().optional().default(0),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			let cart = (await getCartById(input.cartId)) ?? raise('cart not found');
			const funnel = cart.funnel ?? raise('funnel not found');

			// if there is not a fan attached to this cart yet, that means the webhook hasn't fired yet. we need to poll until it does
			const startTime = Date.now();
			const timeout = 15000; // 15 seconds

			do {
				await wait(1000);
				const polledCart = await getCartById(input.cartId); // re-fetch the cart
				if (polledCart) cart = polledCart; // if the cart was found, update the cart
				if (Date.now() - startTime > timeout) {
					throw new Error('Timeout: Fan information not found after 15 seconds');
				}
			} while (!cart.fan);

			/* don't charge the user if they've already converted */
			if (cart.stage === 'upsellConverted') {
				return {
					handle: funnel.workspace.handle,
					key: funnel.key,
					paymentStatus: 'succeeded',
				};
			}

			const upsellProduct = funnel.upsellProduct ?? raise('upsell product not found');

			const fan = cart.fan ?? raise('fan not found to buy upsell');

			const stripePaymentMethodId =
				cart.checkoutStripePaymentMethodId ?? raise('stripePaymentMethodId not found');

			const upsellProductAmount =
				upsellProduct.price - (funnel.upsellProductDiscount ?? 0);
			const upsellShippingAmount = cart.upsellShippingPrice ?? 0; // todo - get shipping delta for upsell product
			const upsellHandlingAmount = 0;

			const paymentIntentRes = await stripe.paymentIntents.create(
				{
					amount: upsellProductAmount + upsellShippingAmount,
					application_fee_amount: getFeeAmountForCheckout({
						amount: upsellProductAmount,
						workspace: funnel.workspace,
					}),
					currency: 'usd',
					customer: cart.fan?.stripeCustomerId ?? undefined,
					payment_method: stripePaymentMethodId,
					return_url: getAbsoluteUrl(
						'app',
						`/${funnel.workspace.handle}/${funnel.key}/success`,
					),
					confirm: true, // this will immediately attempt to charge the customer
					metadata: {
						cartId: cart.id,
						preChargeCartStage: 'upsellCreated',
					},
				},
				{
					stripeAccount:
						getStripeConnectAccountId(funnel.workspace) ??
						raise('stripeAccount not found'),
				},
			);

			const paymentStatus = paymentIntentRes.status;
			const charge = paymentIntentRes.latest_charge;

			const updateCart: UpdateCart = { id: cart.id };

			updateCart.upsellProductId = upsellProduct.id;
			if (input.apparelSize) updateCart.upsellProductApparelSize = input.apparelSize;
			updateCart.upsellProductAmount = upsellProductAmount;
			updateCart.upsellShippingAmount = upsellShippingAmount;
			updateCart.upsellHandlingAmount = 0;
			updateCart.upsellShippingAndHandlingAmount =
				upsellShippingAmount + upsellHandlingAmount;
			updateCart.upsellAmount =
				upsellProductAmount + upsellShippingAmount + upsellHandlingAmount;

			updateCart.upsellStripePaymentIntentId = paymentIntentRes.id;
			updateCart.upsellStripeChargeId =
				typeof charge === 'string' ? charge : charge?.id ?? null;

			updateCart.orderProductAmount =
				cart.mainProductAmount + (cart.bumpProductAmount ?? 0) + upsellProductAmount;
			updateCart.orderShippingAmount =
				(cart.mainShippingAmount ?? 0) +
				(cart.bumpShippingAmount ?? 0) +
				upsellShippingAmount;
			updateCart.orderHandlingAmount =
				(cart.mainHandlingAmount ?? 0) +
				(cart.bumpHandlingAmount ?? 0) +
				upsellHandlingAmount;
			updateCart.orderShippingAndHandlingAmount =
				updateCart.orderShippingAmount + updateCart.orderHandlingAmount;
			updateCart.orderAmount =
				updateCart.orderProductAmount + updateCart.orderShippingAndHandlingAmount;

			updateCart.stage = 'upsellConverted';
			updateCart.upsellConvertedAt = new Date();

			if (ctx.visitor?.ip) {
				await recordCartEvent({
					cart,
					cartFunnel: funnel,
					type: 'cart/purchaseUpsell',
					visitor: ctx.visitor,
				}).catch(err => {
					console.log('error recording upsellcart event:', err);
				});
			}

			await sendCartReceiptEmail({
				...cart,
				...updateCart,
				fan,
				funnel,
				mainProduct: funnel.mainProduct,
				bumpProduct: funnel.bumpProduct,
				upsellProduct: funnel.upsellProduct,
			}).then(() => {
				updateCart.orderReceiptSent = true;
			});

			await ctx.db.pool
				.update(Carts)
				.set({
					...updateCart,
					visitorIp: ctx.visitor?.ip,
					visitorGeo: ctx.visitor?.geo,
					visitorUserAgent: ctx.visitor?.userAgent,
				})
				.where(eq(Carts.id, input.cartId));

			await incrementAssetValuesOnCartPurchase(cart, upsellProductAmount);

			return {
				handle: funnel.workspace.handle,
				key: funnel.key,
				paymentStatus,
			};
		}),

	declineUpsell: publicProcedure
		.input(z.object({ cartId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			let cart = (await getCartById(input.cartId)) ?? raise('cart not found');

			// if there is not a fan attached to this cart yet, that means the webhook hasn't fired yet. we need to poll until it does
			const startTime = Date.now();
			const timeout = 40000; // 40 seconds

			do {
				await wait(1000);
				const polledCart = await getCartById(input.cartId); // re-fetch the cart
				if (polledCart) cart = polledCart; // if the cart was found, update the cart
				if (Date.now() - startTime > timeout) {
					throw new Error('Timeout: Fan information not found after 40 seconds');
				}
			} while (!cart.fan);

			const fan = cart.fan ?? raise('fan not found to decline upsell');
			const funnel = cart.funnel ?? raise('funnel not found');

			cart.stage = 'upsellDeclined';

			await recordCartEvent({
				cart,
				cartFunnel: funnel,
				type: 'cart/declineUpsell',
				visitor: ctx.visitor,
			});
			// if (!!ctx.visitor?.ip || !!cart.visitorIp) {
			// }

			await sendCartReceiptEmail({
				...cart,
				fan,
				funnel,
				mainProduct: funnel.mainProduct,
				bumpProduct: funnel.bumpProduct,
				upsellProduct: funnel.upsellProduct,
			}).then(() => {
				cart.orderReceiptSent = true;
			});

			// console.log('updating declined upsell cart', cart);

			await ctx.db.pool.update(Carts).set(cart).where(eq(Carts.id, input.cartId));

			return {
				handle: funnel.workspace.handle,
				key: funnel.key,
				success: true,
			};
		}),

	// events
	log: publicProcedure
		.input(
			z.object({
				cartId: z.string(),
				event: z.enum(WEB_EVENT_TYPES__CART),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const cart =
				(await ctx.db.pool.query.Carts.findFirst({
					where: eq(Carts.id, input.cartId),
					with: {
						funnel: true,
					},
				})) ?? raise('cart not found');

			const cartFunnel = cart.funnel ?? raise('funnel not found');

			if (!ctx.visitor?.ip && !cart.visitorIp) {
				console.log(
					`no visitor ip to log cart event [${input.event}] for cart ${input.cartId}. visitor >> `,
					ctx.visitor,
				);
				return;
			}

			const updateCart: UpdateCart = { id: cart.id };

			if (!cart.visitorIp) updateCart.visitorIp = ctx.visitor?.ip;
			if (!cart.visitorGeo) updateCart.visitorGeo = ctx.visitor?.geo;
			if (!cart.visitorUserAgent) updateCart.visitorUserAgent = ctx.visitor?.userAgent;
			if (!cart.visitorReferer) updateCart.visitorReferer = ctx.visitor?.referer;
			if (!cart.visitorRefererUrl)
				updateCart.visitorRefererUrl = ctx.visitor?.referer_url;
			if (!cart.visitorCheckoutHref && input.event === 'cart/viewCheckout')
				updateCart.visitorCheckoutHref = ctx.visitor?.href;

			if (
				!!updateCart.visitorIp ||
				!!updateCart.visitorGeo ||
				!!updateCart.visitorUserAgent ||
				!!updateCart.visitorReferer ||
				!!updateCart.visitorRefererUrl ||
				!!updateCart.visitorCheckoutHref
			) {
				await ctx.db.pool.update(Carts).set(updateCart).where(eq(Carts.id, cart.id));
			}

			await recordCartEvent({
				cart,
				cartFunnel,
				type: input.event,
				visitor: ctx.visitor,
			});
		}),
});

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
import { recordCartEvent } from '../event/event.fns';
import { WEB_EVENT_TYPES__CART } from '../event/event.tb';
import { getStripeConnectAccountId } from '../stripe-connect/stripe-connect.fns';
import {
	createMainCartFromFunnel,
	funnelWith,
	getCartById,
	getFunnelByParams,
	getProductsShippingRateEstimate,
	getPublicFunnelFromServerFunnel,
	sendCartReceiptEmail,
} from './cart.fns';
import { updateCheckoutCartFromCheckoutSchema } from './cart.schema';
import { Carts } from './cart.sql';
import { getAmountsForCheckout } from './cart.utils';

export const cartRouter = createTRPCRouter({
	create: publicProcedure
		.input(
			z.object({
				handle: z.string(),
				funnelKey: z.string(),
				shipTo: z
					.object({
						country: z.string().nullable(),
						state: z.string().nullable(),
						city: z.string().nullable(),
					})
					.optional(),
				landingPageId: z.string().nullish(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { handle, funnelKey, ...cartParams } = input;
			const funnel = await getFunnelByParams(handle, funnelKey);

			if (!funnel) throw new Error('funnel not found');

			console.log('trpc.cart.create >> visitor', ctx.visitor);

			const cart = await createMainCartFromFunnel({ funnel, ...cartParams });

			return {
				cart,
				publicFunnel: getPublicFunnelFromServerFunnel(funnel),
			};
		}),

	byIdAndParams: publicProcedure
		.input(z.object({ id: z.string(), handle: z.string(), funnelKey: z.string() }))
		.query(async ({ input, ctx }) => {
			const funnel = await ctx.db.pool.query.CartFunnels.findFirst({
				where: and(
					eq(CartFunnels.handle, input.handle),
					eq(CartFunnels.key, input.funnelKey),
				),
				with: {
					...funnelWith,
					_carts: {
						where: eq(Carts.id, input.id),
						limit: 1,
					},
				},
			});

			if (!funnel) throw new Error('funnel not found');

			const cart = funnel._carts[0];

			return {
				cart: cart ?? (await createMainCartFromFunnel({ funnel })),
				publicFunnel: getPublicFunnelFromServerFunnel(funnel),
			};
		}),

	updateCheckoutFromCheckout: publicProcedure
		.input(updateCheckoutCartFromCheckoutSchema)
		.mutation(async ({ input, ctx }) => {
			const { id, handle, funnelKey, ...update } = input;

			console.log(' trpc.cart.updateCheckoutFromCheckout >> visitor', ctx.visitor);
			const cart = await getCartById(id, handle, funnelKey);
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
			console.log('updated amounts', amounts);

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
				{ amount: amounts.orderAmount },
				{ stripeAccount: stripeAccount ?? raise('stripeAccount not found') },
			);

			return {
				cart: carts[0],
			};
		}),

	buyUpsell: publicProcedure
		.input(
			z.object({ cartId: z.string(), upsellIndex: z.number().optional().default(0) }),
		)
		.mutation(async ({ input, ctx }) => {
			let cart = (await getCartById(input.cartId)) ?? raise('cart not found');

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
					handle: cart.funnel?.workspace.handle ?? '',
					funnelKey: cart.funnel?.key ?? '',
					paymentStatus: 'succeeded',
				};
			}

			const funnel = cart.funnel ?? raise('funnel not found');
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

			if (ctx.visitor?.ip) {
				await recordCartEvent({
					cart,
					cartFunnel: funnel,
					type: 'cart_purchaseUpsell',
					...ctx.visitor,
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

			return {
				handle: funnel.workspace.handle,
				funnelKey: funnel.key,
				paymentStatus,
			};
		}),

	declineUpsell: publicProcedure
		.input(z.object({ cartId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			let cart = (await getCartById(input.cartId)) ?? raise('cart not found');

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

			const fan = cart.fan ?? raise('fan not found to decline upsell');
			const funnel = cart.funnel ?? raise('funnel not found');

			cart.stage = 'upsellDeclined';

			if (ctx.visitor?.ip) {
				await recordCartEvent({
					cart,
					cartFunnel: funnel,
					type: 'cart_declineUpsell',
					...ctx.visitor,
				});
			}

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

			console.log('updating declined upsell cart', cart);

			await ctx.db.pool.update(Carts).set(cart).where(eq(Carts.id, input.cartId));

			return {
				handle: funnel.workspace.handle,
				funnelKey: funnel.key,
				success: true,
			};
		}),

	// events
	logEvent: publicProcedure
		.input(
			z.object({
				cartId: z.string(),
				event: z.enum(WEB_EVENT_TYPES__CART),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			if (!ctx.visitor?.ip) {
				console.log(
					`no visitor ip to log cart event [${input.event}] for cart ${input.cartId}. visitor >> `,
					ctx.visitor,
				);
				return;
			}

			const cart =
				(await ctx.db.pool.query.Carts.findFirst({
					where: eq(Carts.id, input.cartId),
					with: {
						funnel: true,
					},
				})) ?? raise('cart not found');

			const cartFunnel = cart.funnel ?? raise('funnel not found');

			console.log('preparing to record cart event', cart.id, input.event, ctx.visitor);
			await recordCartEvent({
				cart,
				cartFunnel,
				type: input.event,
				...ctx.visitor,
			});
		}),
});

import { TRPCError } from '@trpc/server';
import { and, eq, not } from 'drizzle-orm';
import { z } from 'zod';

import type { UpdateCart } from './cart.schema';
import { isProduction } from '../utils/environment';
import { raise } from '../utils/raise';
import { getAbsoluteUrl } from '../utils/url';
import { createTRPCRouter, publicProcedure } from './api/trpc';
import { CartFunnels } from './cart-funnel.sql';
import {
	createMainCartFromFunnel,
	funnelWith,
	getCartById,
	getProductsShippingRateEstimate,
	getPublicFunnelByHandleAndKey,
	sendCartReceiptEmail,
} from './cart.fns';
import { updateMainCartFromCartSchema } from './cart.schema';
import { Carts } from './cart.sql';
import { getAmountsForMainCart } from './cart.utils';
import { getStripeConnectAccountId } from './stripe-connect.fns';
import { stripe } from './stripe.fns';

export const cartRouter = createTRPCRouter({
	createByFunnelKey: publicProcedure
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
			}),
		)
		.mutation(async ({ input }) => {
			const funnel = await getPublicFunnelByHandleAndKey(input.handle, input.funnelKey);

			if (!funnel) throw new Error('funnel not found');

			const cart = await createMainCartFromFunnel(funnel, input.shipTo);

			return {
				funnel,
				cart,
			};
		}),

	getByIdAndFunnelKey: publicProcedure
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
				cart: cart ?? (await createMainCartFromFunnel(funnel)),
				funnel,
			};
		}),

	updateMainCartFromCart: publicProcedure
		.input(updateMainCartFromCartSchema)
		.mutation(async ({ input, ctx }) => {
			const { id, ...update } = input;

			const cart = await getCartById(id);
			if (!cart) throw new TRPCError({ code: 'NOT_FOUND', message: 'Cart not found' });

			const { funnel } = cart;
			if (!funnel) throw new Error('funnel not found');

			const updatedCart = {
				...cart,
				...update,
			};

			if (update.shippingAddressPostalCode) {
				console.log('postal code updated');
				const toCountry = update.shippingAddressCountry ?? cart.shippingAddressCountry;
				const toState = update.shippingAddressState ?? cart.shippingAddressState;
				const toCity = update.shippingAddressCity ?? cart.shippingAddressCity;
				const toPostalCode =
					update.shippingAddressPostalCode ?? cart.shippingAddressPostalCode;

				if (toCountry && toState && toCity && toPostalCode) {
					const mainProductShippingRate = await getProductsShippingRateEstimate({
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

					const mainProductShippingAmount =
						mainProductShippingRate?.shipping_amount.amount ?? 1000;
					updatedCart.mainProductShippingAmount = mainProductShippingAmount;

					const mainPlusBumpShippingRate = !funnel.bumpProduct
						? mainProductShippingRate
						: await getProductsShippingRateEstimate({
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
							});

					if (mainPlusBumpShippingRate) {
						console.log('mainPlusBumpShippingAmount', mainPlusBumpShippingRate);
						updatedCart.bumpProductShippingPrice =
							mainPlusBumpShippingRate.shipping_amount.amount - mainProductShippingAmount;
					}
				}
			}

			const amounts = getAmountsForMainCart(funnel, updatedCart);
			console.log('amounts', amounts);

			const carts = await ctx.db.pool
				.update(Carts)
				.set({
					...amounts,
				})
				.where(and(eq(Carts.id, id), not(eq(Carts.status, 'converted'))))
				.returning();

			const stripePaymentIntentId = carts[0]?.mainStripePaymentIntentId;
			if (!stripePaymentIntentId) throw new Error('stripePaymentIntentId not found');

			const stripeAccount = isProduction()
				? funnel.workspace.stripeConnectAccountId
				: funnel.workspace.stripeConnectAccountId_devMode;

			// we need to update the paymentIntent amount
			await stripe.paymentIntents.update(
				stripePaymentIntentId,
				{ amount: amounts.amount },
				{ stripeAccount: stripeAccount ?? raise('stripeAccount not found') },
			);
		}),

	buyUpsell: publicProcedure
		.input(
			z.object({ cartId: z.string(), upsellIndex: z.number().optional().default(0) }),
		)
		.mutation(async ({ input, ctx }) => {
			const cart = (await getCartById(input.cartId)) ?? raise('cart not found');

			/* don't charge the user if they've already converted */
			if (cart.stage === 'upsellConverted') {
				return {
					handle: cart.funnel?.workspace.handle ?? '',
					funnelKey: cart.funnel?.key ?? '',
					paymentStatus: 'succeeded',
				};
			}

			const funnel = cart.funnel ?? raise('funnel not found');
			const fan = cart.fan ?? raise('fan not found');
			const upsellProduct = funnel.upsellProduct ?? raise('upsell product not found');

			const stripePaymentMethodId =
				cart.mainStripePaymentMethodId ?? raise('stripePaymentMethodId not found');

			const upsellProductAmount =
				upsellProduct.price - (funnel.upsellProductDiscount ?? 0);
			const upsellShippingAmount = cart.upsellProductShippingPrice ?? 0; // todo - get shipping delta for upsell product

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
			updateCart.upsellAmount = upsellProductAmount + upsellShippingAmount;
			updateCart.amount =
				cart.mainPlusBumpAmount + upsellProductAmount + upsellShippingAmount;
			updateCart.upsellStripePaymentIntentId = paymentIntentRes.id;
			updateCart.upsellStripeChargeId =
				typeof charge === 'string' ? charge : charge?.id ?? null;

			updateCart.shippingAndHandlingAmount =
				(cart.mainPlusBumpShippingAndHandlingAmount ?? 0) + upsellShippingAmount;
			updateCart.amount =
				cart.mainPlusBumpAmount + upsellProductAmount + upsellShippingAmount;

			updateCart.stage = 'upsellConverted';

			await sendCartReceiptEmail({
				...cart,
				...updateCart,
				fan,
				funnel,
				mainProduct: funnel.mainProduct,
				bumpProduct: funnel.bumpProduct,
				upsellProduct: funnel.upsellProduct,
			});

			updateCart.receiptSent = true;

			await ctx.db.pool.update(Carts).set(updateCart).where(eq(Carts.id, input.cartId));

			return {
				handle: funnel.workspace.handle,
				funnelKey: funnel.key,
				paymentStatus,
			};
		}),

	declineUpsell: publicProcedure
		.input(z.object({ cartId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const cart = (await getCartById(input.cartId)) ?? raise('cart not found');
			const fan = cart.fan ?? raise('fan not found');
			const funnel = cart.funnel ?? raise('funnel not found');

			cart.stage === 'upsellDeclined';

			await sendCartReceiptEmail({
				...cart,
				fan,
				funnel,
				mainProduct: funnel.mainProduct,
				bumpProduct: funnel.bumpProduct,
				upsellProduct: funnel.upsellProduct,
			});

			cart.receiptSent = true;

			await ctx.db.pool.update(Carts).set(cart).where(eq(Carts.id, input.cartId));

			return {
				handle: funnel.workspace.handle,
				funnelKey: funnel.key,
				success: true,
			};
		}),
});

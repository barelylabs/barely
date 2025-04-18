import { sendEmail } from '@barely/email';
import ShippingUpdateEmailTemplate from '@barely/email/src/templates/cart/shipping-update';
import {
	and,
	asc,
	eq,
	gt,
	ilike,
	inArray,
	isNotNull,
	isNull,
	ne,
	notInArray,
	or,
} from 'drizzle-orm';
import { z } from 'zod';

import type { ApparelSize } from '../product/product.constants';
import type { Product } from '../product/product.schema';
import { isDevelopment } from '../../../utils/environment';
import { newId } from '../../../utils/id';
import { numToPaddedString } from '../../../utils/number';
import { raise } from '../../../utils/raise';
import { sqlAnd } from '../../../utils/sql';
import {
	createTRPCRouter,
	privateProcedure,
	workspaceQueryProcedure,
} from '../../api/trpc';
import { getTrackingLink } from '../../shipping/shipping.utils';
import { stripe } from '../../stripe';
import { getOrCreateCartOrderId } from '../cart/cart.fns';
import { CartFulfillmentProducts, CartFulfillments, Carts } from '../cart/cart.sql';
import { Fans } from '../fan/fan.sql';
import { Products } from '../product/product.sql';
import { getStripeConnectAccountId } from '../stripe-connect/stripe-connect.fns';
import {
	markCartOrderAsFulfilledSchema,
	selectWorkspaceCartOrdersSchema,
} from './cart-order.schema';

export const cartOrderRouter = createTRPCRouter({
	byWorkspace: workspaceQueryProcedure
		.input(selectWorkspaceCartOrdersSchema)
		.query(async ({ input, ctx }) => {
			const { showFulfilled, showCanceled, showPreorders, search, fanId, limit, cursor } =
				input;

			let searchFanIds: string[] = [];
			if (search) {
				const fans = await ctx.db.pool.query.Fans.findMany({
					where: and(
						eq(Fans.workspaceId, ctx.workspace.id),
						or(
							ilike(Fans.fullName, `%${search}%`),
							ilike(Fans.email, `%${search}%`),
							ilike(Fans.shippingAddressLine1, `%${search}%`),
						),
					),
				});

				searchFanIds = fans.map(f => f.id);

				if (searchFanIds.length === 0) {
					return {
						cartOrders: [],
						nextCursor: undefined,
					};
				}
			}

			let preorderProductIds: string[] = [];
			if (!showPreorders) {
				preorderProductIds = (
					await ctx.db.pool.query.Products.findMany({
						where: and(
							eq(Products.workspaceId, ctx.workspace.id),
							eq(Products.preorder, true),
						),
						columns: {
							id: true,
						},
					})
				).map(p => p.id);
			}

			let orders = await ctx.db.pool.query.Carts.findMany({
				where: sqlAnd([
					eq(Carts.workspaceId, ctx.workspace.id),
					isNotNull(Carts.orderId),
					!showFulfilled && ne(Carts.fulfillmentStatus, 'fulfilled'),
					!showCanceled && isNull(Carts.canceledAt),
					inArray(Carts.stage, [
						'checkoutConverted',
						'upsellConverted',
						'upsellAbandoned',
						'upsellDeclined',
					]),
					eq(Carts.workspaceId, ctx.workspace.id),
					!!fanId && eq(Carts.fanId, fanId),
					!!searchFanIds.length && inArray(Carts.fanId, searchFanIds),
					!!preorderProductIds.length &&
						// sqlAnd([
						//     notInArray(Carts.mainProductId, preorderProductIds),
						//     or(
						//         isNull(Carts.bumpProductId),
						//         eq(Carts.addedBump, false),
						//         notInArray(Carts.bumpProductId, preorderProductIds),
						//     ),
						//     or(
						//         isNull(Carts.upsellProductId),
						//         isNull(Carts.upsellConvertedAt),
						//         notInArray(Carts.upsellProductId, preorderProductIds),
						//     ),
						// ]),
						or(
							notInArray(Carts.mainProductId, preorderProductIds),
							or(
								eq(Carts.addedBump, false),
								notInArray(Carts.bumpProductId, preorderProductIds),
							),
							or(
								isNull(Carts.upsellConvertedAt),
								notInArray(Carts.upsellProductId, preorderProductIds),
							),
						),
					!!cursor &&
						or(
							or(
								gt(Carts.checkoutConvertedAt, cursor.checkoutConvertedAt),
								isNull(Carts.checkoutConvertedAt),
							),
							and(
								eq(Carts.checkoutConvertedAt, cursor.checkoutConvertedAt),
								gt(Carts.orderId, cursor.orderId),
							),
						),
				]),
				with: {
					mainProduct: true,
					bumpProduct: true,
					upsellProduct: true,
					fulfillments: {
						with: {
							products: true,
						},
					},
					funnel: {
						columns: {
							name: true,
						},
					},
				},
				orderBy: [asc(Carts.checkoutConvertedAt), asc(Carts.orderId)],
				limit: limit + 1,
			});

			// if we're not showing preorders, we filter out any orders where there are only preorders left to fulfill
			if (!showFulfilled && preorderProductIds.length) {
				orders = orders.filter(order => {
					const fulfilledProductIds = order.fulfillments.flatMap(fulfillment =>
						fulfillment.products.map(product => product.productId),
					);

					// console.log('fulfilledProductIds', fulfilledProductIds);

					const unfulfilledProductIds = [];

					if (order.mainProductId && !fulfilledProductIds.includes(order.mainProductId)) {
						unfulfilledProductIds.push(order.mainProductId);
					}

					if (
						order.addedBump &&
						order.bumpProductId &&
						!fulfilledProductIds.includes(order.bumpProductId)
					) {
						unfulfilledProductIds.push(order.bumpProductId);
					}

					if (
						order.upsellConvertedAt &&
						order.upsellProductId &&
						!fulfilledProductIds.includes(order.upsellProductId)
					) {
						unfulfilledProductIds.push(order.upsellProductId);
					}

					// console.log('unfulfilledProductIds', unfulfilledProductIds);

					const hasFulfillableProduct = unfulfilledProductIds.some(
						productId => !preorderProductIds.includes(productId),
					);

					// console.log('hasFulfillableProduct', hasFulfillableProduct);

					return hasFulfillableProduct;

					// return remainingProducts.every(productId =>
					// 	preorderProductIds.includes(productId),
					// );
				});
			}

			let nextCursor: typeof cursor | undefined = undefined;

			if (orders.length > limit) {
				const nextOrder = orders.pop();
				nextCursor =
					nextOrder ?
						{
							orderId: nextOrder?.orderId ?? raise('orderId should be defined'),
							checkoutConvertedAt:
								nextOrder?.checkoutConvertedAt ??
								raise('checkoutConvertedAt should be defined'),
						}
					:	undefined;
			}

			const cartOrders = orders.map(order => {
				const fulfilledProductIds = order.fulfillments.flatMap(fulfillment =>
					fulfillment.products.map(product => product.productId),
				);

				return {
					...order,
					products: [
						{
							...order.mainProduct,
							fulfilled: fulfilledProductIds.includes(order.mainProductId),
							apparelSize: order.mainProductApparelSize,
						},
						order.addedBump && order.bumpProduct ?
							{
								...order.bumpProduct,
								fulfilled: fulfilledProductIds.includes(order.bumpProduct.id),
								apparelSize: order.bumpProductApparelSize,
							}
						:	null,
						order.upsellConvertedAt && order.upsellProduct ?
							{
								...order.upsellProduct,
								fulfilled: fulfilledProductIds.includes(order.upsellProduct.id),
								apparelSize: order.upsellProductApparelSize,
							}
						:	null,
					].filter(Boolean) as (Product & {
						fulfilled: boolean;
						apparelSize: ApparelSize | null;
					})[],
				};
			});

			return {
				cartOrders: cartOrders.slice(0, limit),
				nextCursor,
			};
		}),

	fulfillmentsByCartId: workspaceQueryProcedure
		.input(
			z.object({
				cartId: z.string(),
				// handle: z.string(),
			}),
		)
		.query(async ({ input, ctx }) => {
			const fulfillments = await ctx.db.http.query.CartFulfillments.findMany({
				where: and(eq(CartFulfillments.cartId, input.cartId)),
				with: {
					cart: {
						columns: {
							workspaceId: true,
						},
					},
				},
			});

			return fulfillments.filter(
				fulfillment => fulfillment.cart?.workspaceId === ctx.workspace.id,
			);
		}),

	cancel: privateProcedure
		.input(
			z.object({
				cartId: z.string(),
				reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer']),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const cart =
				(await ctx.db.pool.query.Carts.findFirst({
					where: and(eq(Carts.workspaceId, ctx.workspace.id), eq(Carts.id, input.cartId)),
				})) ?? raise('Cart not found to cancel');

			await stripe.refunds
				.create(
					{
						charge:
							cart.checkoutStripeChargeId ?? raise('checkoutStripeChargeId not found'),
						reason: input.reason,
						// reverse_transfer: true,
					},
					{
						stripeAccount:
							getStripeConnectAccountId(ctx.workspace) ??
							raise('stripeAccount not found'),
					},
				)
				.catch(error => {
					console.error('error refunding charge', error);
					throw new Error(
						`Failed to process refund: ${error instanceof Error ? error.message : 'Unknown error'}`,
					);
				});

			if (cart.upsellConvertedAt && cart.upsellStripeChargeId) {
				await stripe.refunds
					.create(
						{
							charge: cart.upsellStripeChargeId,
							reason: input.reason,
							// reverse_transfer: true,
						},
						{
							stripeAccount:
								getStripeConnectAccountId(ctx.workspace) ??
								raise('stripeAccount not found'),
						},
					)
					.catch(error => {
						console.error('error refunding upsell charge', error);
						throw new Error(
							`Failed to process upsell refund: ${error instanceof Error ? error.message : 'Unknown error'}`,
						);
					});
			}

			await ctx.db.pool
				.update(Carts)
				.set({
					canceledAt: new Date(),
					refundedAt: new Date(),
					refundedAmount: cart.orderAmount,
				})
				.where(and(eq(Carts.workspaceId, ctx.workspace.id), eq(Carts.id, input.cartId)));
		}),
	markAsFullfilled: privateProcedure
		.input(markCartOrderAsFulfilledSchema)
		.mutation(async ({ input, ctx }) => {
			// console.log('marking as fulfilled', input.cartId);

			// console.log('products', input.products);

			// return;
			const cart =
				(await ctx.db.pool.query.Carts.findFirst({
					where: and(eq(Carts.workspaceId, ctx.workspace.id), eq(Carts.id, input.cartId)),
					with: {
						fan: true,
						funnel: {
							with: {
								workspace: true,
							},
						},
					},
				})) ?? raise('Cart not found to fulfill');

			const fan = cart.fan ?? raise('Fan not found');

			// console.log('cart to mark as fulfilled', cart);

			// create a new fulfillment
			const cartFulfillmentId = newId('cartFulfillment');

			await ctx.db.pool.insert(CartFulfillments).values({
				id: cartFulfillmentId,
				cartId: cart.id,
				shippingCarrier: input.shippingCarrier,
				shippingTrackingNumber: input.shippingTrackingNumber,
			});

			// console.log('cartFulfillmentId', cartFulfillmentId);

			const fulfilledProducts = input.products.filter(product => product.fulfilled);

			// console.log('fulfilledProducts', fulfilledProducts);

			await ctx.db.pool.insert(CartFulfillmentProducts).values(
				fulfilledProducts.map(product => ({
					cartFulfillmentId,
					productId: product.id,
					apparelSize: product.apparelSize,
				})),
			);

			// we need to check if the cart is partially_fulfilled or fulfilled
			const orderProductIds = [
				cart.mainProductId,
				cart.addedBump ? cart.bumpProductId : null,
				cart.upsellConvertedAt ? cart.upsellProductId : null,
			].filter(Boolean) as string[];

			const allCartFulfillments = await ctx.db.pool.query.CartFulfillments.findMany({
				where: eq(CartFulfillments.cartId, cart.id),
				with: {
					products: {
						with: {
							product: true,
						},
					},
				},
			});

			const allFulfilledProductIds = allCartFulfillments.flatMap(fulfillment =>
				fulfillment.products.map(product => product.productId),
			);

			const fulfillmentStatus =
				orderProductIds.every(productId => allFulfilledProductIds.includes(productId)) ?
					'fulfilled'
				:	'partially_fulfilled';

			await ctx.db.pool
				.update(Carts)
				.set({
					fulfillmentStatus,
					fulfilledAt: fulfillmentStatus === 'fulfilled' ? new Date() : undefined,
				})
				.where(and(eq(Carts.workspaceId, ctx.workspace.id), eq(Carts.id, input.cartId)));

			const orderId = numToPaddedString(await getOrCreateCartOrderId(cart), {
				digits: 6,
			});

			const { shippingCarrier, shippingTrackingNumber } = input;

			if (shippingCarrier && shippingTrackingNumber) {
				const allProducts = allCartFulfillments.flatMap(f =>
					f.products.map(p => p.product),
				);

				const shippedProducts = input.products
					.filter(p => p.fulfilled)
					.map(fulfilledProduct => {
						return {
							id: fulfilledProduct.id,
							name: allProducts.find(p => p?.id === fulfilledProduct.id)?.name ?? '',
							apparelSize: fulfilledProduct.apparelSize,
						};
					})
					.filter(p => p.name.length > 0);

				// console.log('shippedProducts', shippedProducts);

				const ShippingUpdateEmail = ShippingUpdateEmailTemplate({
					orderId,
					date: new Date(),
					sellerName: cart.funnel?.workspace.name ?? 'Barely',
					supportEmail:
						isDevelopment() ? 'adam@barely.io' : (
							(cart.funnel?.workspace.cartSupportEmail ?? 'support@barely.io')
						),
					trackingNumber: shippingTrackingNumber,
					trackingLink: getTrackingLink({
						carrier: shippingCarrier,
						trackingNumber: shippingTrackingNumber,
					}),
					shippingAddress: {
						name: fan.fullName ?? cart.fullName,
						line1: cart.shippingAddressLine1,
						line2: cart.shippingAddressLine2,
						city: cart.shippingAddressCity,
						state: cart.shippingAddressState,
						postalCode: cart.shippingAddressPostalCode,
						country: cart.shippingAddressCountry,
					},

					products: shippedProducts,
				});

				await sendEmail({
					from: 'orders@barelycart.email',
					fromFriendlyName: ctx.workspace.name,
					to: isDevelopment() ? `adam+order-${orderId}@barely.io` : fan.email,
					bcc: [
						'adam@barely.io',
						...(isDevelopment() ?
							[]
						:	[cart.funnel?.workspace.cartSupportEmail ?? ''].filter(s => s.length > 0)),
					],
					subject: 'Your order has been fulfilled!',
					type: 'transactional',
					react: ShippingUpdateEmail,
				});
			}
		}),
});

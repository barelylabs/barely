import { sendEmail } from '@barely/email';
import ShippingUpdateEmailTemplate from '@barely/email/src/templates/cart/shipping-update';
import { and, asc, desc, eq, gt, inArray, isNotNull, lt, or } from 'drizzle-orm';
import { z } from 'zod';

import type { ApparelSize } from '../product/product.constants';
import type { Product } from '../product/product.schema';
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
import { getOrCreateCartOrderId } from '../cart/cart.fns';
import { CartFulfillmentProducts, CartFullfillments, Carts } from '../cart/cart.sql';
import {
	markCartOrderAsFulfilledSchema,
	selectWorkspaceCartOrdersSchema,
} from './cart-order.schema';

export const cartOrderRouter = createTRPCRouter({
	byWorkspace: workspaceQueryProcedure
		.input(selectWorkspaceCartOrdersSchema)
		.query(async ({ input, ctx }) => {
			const { limit, cursor } = input;
			const orders = await ctx.db.http.query.Carts.findMany({
				where: sqlAnd([
					eq(Carts.workspaceId, ctx.workspace.id),
					isNotNull(Carts.orderId),
					inArray(Carts.stage, [
						'checkoutConverted',
						'upsellConverted',
						'upsellAbandoned',
						'upsellDeclined',
					]),
					!!cursor &&
						or(
							lt(Carts.checkoutConvertedAt, cursor.checkoutConvertedAt),
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
				},
				orderBy: [desc(Carts.checkoutConvertedAt), asc(Carts.orderId)],
				limit: limit + 1,
			});

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
				cartOrders,
				nextCursor,
			};
		}),

	fulfillmentsByCartId: workspaceQueryProcedure
		.input(
			z.object({
				cartId: z.string(),
				handle: z.string(),
			}),
		)
		.query(async ({ input, ctx }) => {
			const fulfillments = await ctx.db.http.query.CartFullfillments.findMany({
				where: and(eq(CartFullfillments.cartId, input.cartId)),
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

	markAsFullfilled: privateProcedure
		.input(markCartOrderAsFulfilledSchema)
		.mutation(async ({ input, ctx }) => {
			console.log('marking as fulfilled', input.cartId);
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

			console.log('cart to mark as fulfilled', cart);
			// create a new fulfillment
			const cartFulfillmentId = newId('cartFulfillment');
			// await ctx.db.http.insert(CartFullfillments).values({
			await ctx.db.pool.insert(CartFullfillments).values({
				id: cartFulfillmentId,
				cartId: cart.id,
				shippingCarrier: input.shippingCarrier,
				shippingTrackingNumber: input.shippingTrackingNumber,
				// fulfilledAt: new Date(),
			});

			console.log('cartFulfillmentId', cartFulfillmentId);
			// add products to the fulfillment
			await ctx.db.http.insert(CartFulfillmentProducts).values(
				// await ctx.db.pool.insert(CartFulfillmentProducts).values(
				input.products.map(product => ({
					cartFulfillmentId,
					productId: product.id,
				})),
			);

			// we need to check if the cart is partially_fulfilled or fulfilled
			const orderProductIds = [
				cart.mainProductId,
				cart.addedBump ? cart.bumpProductId : null,
				cart.upsellConvertedAt ? cart.upsellProductId : null,
			].filter(Boolean) as string[];

			const allCartFullfillments = await ctx.db.pool.query.CartFullfillments.findMany({
				where: eq(CartFullfillments.cartId, cart.id),
				with: {
					products: {
						with: {
							product: true,
						},
					},
				},
			});

			const allFulfilledProductIds = allCartFullfillments.flatMap(fulfillment =>
				fulfillment.products.map(product => product.productId),
			);

			const fulfillmentStatus =
				orderProductIds.every(productId => allFulfilledProductIds.includes(productId)) ?
					'fulfilled'
				:	'partially_fulfilled';

			await ctx.db.http
				// await ctx.db.pool
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
				const shippedProducts = allCartFullfillments.flatMap(fulfillment =>
					fulfillment.products
						.map(p => ({
							name: p.product?.name ?? '',
						}))
						.filter(p => p.name.length > 0),
				);

				const ShippingUpdateEmail = ShippingUpdateEmailTemplate({
					orderId,
					date: new Date(),
					sellerName: cart.funnel?.workspace.name ?? 'Barely',
					supportEmail: cart.funnel?.workspace.cartSupportEmail ?? 'support@barely.io',
					trackingNumber: shippingTrackingNumber,
					trackingLink: getTrackingLink({
						carrier: shippingCarrier,
						trackingNumber: shippingTrackingNumber,
					}),
					shippingAddress: {
						name: fan.fullName,
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
					to: fan.email,
					bcc: ['adam@barely.io', cart.funnel?.workspace.cartSupportEmail ?? ''].filter(
						s => s.length > 0,
					),
					subject: 'Your order has been fulfilled!',
					type: 'transactional',
					react: ShippingUpdateEmail,
				});
			}
		}),
});

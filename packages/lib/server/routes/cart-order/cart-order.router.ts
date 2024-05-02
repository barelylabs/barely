import { and, asc, desc, eq, gt, inArray, isNotNull, lt, or } from 'drizzle-orm';

import type { ApparelSize } from '../product/product.constants';
import type { Product } from '../product/product.schema';
import { newId } from '../../../utils/id';
import { raise } from '../../../utils/raise';
import { sqlAnd } from '../../../utils/sql';
import {
	createTRPCRouter,
	privateProcedure,
	workspaceQueryProcedure,
} from '../../api/trpc';
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

	markAsFullfilled: privateProcedure
		.input(markCartOrderAsFulfilledSchema)
		.mutation(async ({ input, ctx }) => {
			const cart =
				(await ctx.db.http.query.Carts.findFirst({
					where: and(eq(Carts.workspaceId, ctx.workspace.id), eq(Carts.id, input.cartId)),
				})) ?? raise('Cart not found to fulfill');

			// create a new fulfillment
			const cartFulfillmentId = newId('cartFulfillment');
			await ctx.db.pool.insert(CartFullfillments).values({
				id: cartFulfillmentId,
				cartId: cart.id,
				shippingCarrier: input.shippingCarrier,
				shippingTrackingNumber: input.shippingTrackingNumber,
				fulfilledAt: new Date(),
			});

			// add products to the fulfillment
			await ctx.db.pool.insert(CartFulfillmentProducts).values(
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
					products: true,
				},
			});

			const allFulfilledProductIds = allCartFullfillments.flatMap(fulfillment =>
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
		}),
});

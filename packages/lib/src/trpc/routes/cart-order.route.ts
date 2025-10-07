import type { ApparelSize, Product } from '@barely/validators';
import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { dbPool } from '@barely/db/pool';
import {
	CartFulfillmentProducts,
	CartFulfillments,
	Carts,
} from '@barely/db/sql/cart.sql';
import { Fans } from '@barely/db/sql/fan.sql';
import { Products } from '@barely/db/sql/product.sql';
import { sqlAnd } from '@barely/db/utils';
import { sendEmail } from '@barely/email';
import { ShippingUpdateEmailTemplate } from '@barely/email/templates/cart';
import {
	getTrackingLink,
	isDevelopment,
	newId,
	numToPaddedString,
	raiseTRPCError,
} from '@barely/utils';
import {
	markCartOrderAsFulfilledSchema,
	selectWorkspaceCartOrdersSchema,
	shipCartOrderSchema,
} from '@barely/validators';
import { TRPCError } from '@trpc/server';
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
import { z } from 'zod/v4';

import {
	getOrCreateCartOrderId,
	getProductsShippingRateEstimate,
} from '../../functions/cart.fns';
import { getStripeConnectAccountId } from '../../functions/stripe-connect.fns';
import { createShippingLabel } from '../../integrations/shipping/shipengine.endpts';
import { stripe } from '../../integrations/stripe';
import { workspaceProcedure } from '../trpc';

export const cartOrderRoute = {
	byWorkspace: workspaceProcedure
		.input(selectWorkspaceCartOrdersSchema)
		.query(async ({ input, ctx }) => {
			const { showFulfilled, showCanceled, showPreorders, search, fanId, limit, cursor } =
				input;

			let searchFanIds: string[] = [];
			if (search && search.length > 0) {
				const fans = await dbPool(ctx.pool).query.Fans.findMany({
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
					await dbPool(ctx.pool)
						.select({ id: Products.id })
						.from(Products)
						.where(
							and(
								eq(Products.workspaceId, ctx.workspace.id),
								eq(Products.preorder, true),
							),
						)
				).map(p => p.id);
			}

			let orders = await dbPool(ctx.pool).query.Carts.findMany({
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
							orderId:
								nextOrder.orderId ??
								raiseTRPCError({ message: 'orderId should be defined' }),
							checkoutConvertedAt:
								nextOrder.checkoutConvertedAt ??
								raiseTRPCError({ message: 'checkoutConvertedAt should be defined' }),
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

	fulfillmentsByCartId: workspaceProcedure
		.input(z.object({ cartId: z.string() }))
		.query(async ({ input, ctx }) => {
			const fulfillments = await dbHttp.query.CartFulfillments.findMany({
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

	cancel: workspaceProcedure
		.input(
			z.object({
				cartId: z.string(),
				reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer']),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const cart =
				(await dbPool(ctx.pool).query.Carts.findFirst({
					where: and(eq(Carts.workspaceId, ctx.workspace.id), eq(Carts.id, input.cartId)),
					with: {
						workspace: true,
					},
				})) ?? raiseTRPCError({ message: 'Cart not found to cancel' });

			await stripe.refunds
				.create(
					{
						charge:
							cart.checkoutStripeChargeId ??
							raiseTRPCError({ message: 'checkoutStripeChargeId not found' }),
						reason: input.reason,
						// reverse_transfer: true,
					},
					{
						stripeAccount:
							getStripeConnectAccountId(cart.workspace) ??
							raiseTRPCError({ message: 'stripeAccount not found' }),
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
								getStripeConnectAccountId(cart.workspace) ??
								raiseTRPCError({ message: 'stripeAccount not found' }),
						},
					)
					.catch(error => {
						console.error('error refunding upsell charge', error);
						throw new Error(
							`Failed to process upsell refund: ${error instanceof Error ? error.message : 'Unknown error'}`,
						);
					});
			}

			await dbPool(ctx.pool)
				.update(Carts)
				.set({
					canceledAt: new Date(),
					refundedAt: new Date(),
					refundedAmount: cart.orderAmount,
				})
				.where(and(eq(Carts.workspaceId, ctx.workspace.id), eq(Carts.id, input.cartId)));
		}),
	markAsFulfilled: workspaceProcedure
		.input(markCartOrderAsFulfilledSchema)
		.mutation(async ({ input, ctx }) => {
			// console.log('marking as fulfilled', input.cartId);

			// console.log('products', input.products);

			// return;
			const cart =
				(await dbPool(ctx.pool).query.Carts.findFirst({
					where: and(eq(Carts.workspaceId, ctx.workspace.id), eq(Carts.id, input.cartId)),
					with: {
						fan: true,
						funnel: {
							with: {
								workspace: true,
							},
						},
					},
				})) ?? raiseTRPCError({ message: 'Cart not found to fulfill' });

			const fan = cart.fan ?? raiseTRPCError({ message: 'Fan not found' });

			// console.log('cart to mark as fulfilled', cart);

			// create a new fulfillment
			const cartFulfillmentId = newId('cartFulfillment');

			await dbPool(ctx.pool).insert(CartFulfillments).values({
				id: cartFulfillmentId,
				cartId: cart.id,
				shippingCarrier: input.shippingCarrier,
				shippingTrackingNumber: input.shippingTrackingNumber,
			});

			// console.log('cartFulfillmentId', cartFulfillmentId);

			const fulfilledProducts = input.products.filter(product => product.fulfilled);

			// console.log('fulfilledProducts', fulfilledProducts);

			await dbPool(ctx.pool)
				.insert(CartFulfillmentProducts)
				.values(
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

			const allCartFulfillments = await dbPool(ctx.pool).query.CartFulfillments.findMany({
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

			await dbPool(ctx.pool)
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
							name: allProducts.find(p => p.id === fulfilledProduct.id)?.name ?? '',
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
						isDevelopment() ? 'adam@barely.ai' : (
							(cart.funnel?.workspace.cartSupportEmail ?? 'support@barely.ai')
						),
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
					fromFriendlyName: ctx.workspace.name,
					to: isDevelopment() ? `adam+order-${orderId}@barely.ai` : fan.email,
					bcc: [
						'adam@barely.ai',
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
	shipOrder: workspaceProcedure
		.input(shipCartOrderSchema)
		.mutation(async ({ input, ctx }) => {
			// 1. Fetch cart with all related data
			const cart = await dbPool(ctx.pool).query.Carts.findFirst({
				where: and(eq(Carts.workspaceId, ctx.workspace.id), eq(Carts.id, input.cartId)),
				with: {
					fan: true,
					workspace: true,
					funnel: {
						with: {
							workspace: true,
						},
					},
					mainProduct: true,
					bumpProduct: true,
					upsellProduct: true,
				},
			});

			if (!cart) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Cart not found',
				});
			}

			// 2. Validate workspace has shipping address configured
			if (
				!ctx.workspace.shippingAddressLine1 ||
				!ctx.workspace.shippingAddressPostalCode
			) {
				throw new TRPCError({
					code: 'PRECONDITION_FAILED',
					message:
						'Workspace shipping address not configured. Please update your settings.',
				});
			}

			// 3. Validate customer shipping address
			if (!cart.shippingAddressLine1 || !cart.shippingAddressPostalCode) {
				throw new TRPCError({
					code: 'PRECONDITION_FAILED',
					message: 'Customer shipping address is incomplete',
				});
			}

			// 4. Determine region for API key selection
			const workspaceCountry = ctx.workspace.shippingAddressCountry?.toUpperCase();
			const region: 'US' | 'UK' =
				workspaceCountry === 'GB' || workspaceCountry === 'UK' ? 'UK' : 'US';

			// 5. Get cheapest rate first (to store estimate vs actual cost)
			const { lowestShippingPrice: estimatedCostCents } =
				await getProductsShippingRateEstimate({
					products: input.products
						.filter(p => p.fulfilled)
						.map(p => {
							let product: Product | null = null;
							// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
							if (cart.mainProduct && cart.mainProduct.id === p.id)
								product = cart.mainProduct;
							else if (cart.bumpProduct && cart.bumpProduct.id === p.id)
								product = cart.bumpProduct;
							else if (cart.upsellProduct && cart.upsellProduct.id === p.id)
								product = cart.upsellProduct;
							return product ? { product, quantity: 1 } : null;
						})
						.filter((p): p is { product: Product; quantity: number } => p !== null),
					shipFrom: {
						postalCode: ctx.workspace.shippingAddressPostalCode,
						countryCode: ctx.workspace.shippingAddressCountry ?? 'US',
						state: ctx.workspace.shippingAddressState ?? '',
					},
					shipTo: {
						postalCode: cart.shippingAddressPostalCode,
						country: cart.shippingAddressCountry ?? 'US',
						city: cart.shippingAddressCity ?? '',
						state: cart.shippingAddressState ?? '',
					},
				});

			// 6. Create shipping label
			let labelResult;

			try {
				labelResult = await createShippingLabel({
					shipFrom: {
						name: ctx.workspace.name,
						companyName: ctx.workspace.name,
						addressLine1: ctx.workspace.shippingAddressLine1,
						addressLine2: ctx.workspace.shippingAddressLine2 ?? undefined,
						city: ctx.workspace.shippingAddressCity ?? '',
						state: ctx.workspace.shippingAddressState ?? '',
						postalCode: ctx.workspace.shippingAddressPostalCode,
						countryCode: ctx.workspace.shippingAddressCountry ?? 'US',
					},
					shipTo: {
						name: cart.fullName ?? 'Customer',
						phone: cart.phone ?? undefined,
						addressLine1: cart.shippingAddressLine1,
						addressLine2: cart.shippingAddressLine2 ?? undefined,
						city: cart.shippingAddressCity ?? '',
						state: cart.shippingAddressState ?? '',
						postalCode: cart.shippingAddressPostalCode,
						countryCode: cart.shippingAddressCountry ?? 'US',
					},
					package: {
						weightOz: input.package.weightOz,
						lengthIn: input.package.lengthIn,
						widthIn: input.package.widthIn,
						heightIn: input.package.heightIn,
					},
					serviceCode: input.serviceCode,
					deliveryConfirmation: input.deliveryConfirmation,
					insuranceAmount: input.insuranceAmount,
					region,
				});
			} catch (error) {
				console.error('Failed to create shipping label:', error);
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: `Failed to create shipping label: ${error instanceof Error ? error.message : 'Unknown error'}`,
				});
			}

			// 7. Calculate cost delta (what we paid vs what customer paid)
			const actualCostCents = labelResult.totalCostCents;
			const collectedCostCents = cart.orderShippingAmount ?? 0;
			const costDelta = actualCostCents - collectedCostCents;

			// 8. Log cost delta for monitoring
			console.log('=== SHIPPING COST ANALYSIS ===');
			console.log(`Order ID: ${cart.orderId}`);
			console.log(`Estimated Cost: ${estimatedCostCents / 100} ${labelResult.currency}`);
			console.log(`Actual Cost: ${actualCostCents / 100} ${labelResult.currency}`);
			console.log(`Customer Paid: ${collectedCostCents / 100} ${labelResult.currency}`);
			console.log(`Delta: ${costDelta / 100} ${labelResult.currency}`);
			console.log(
				`Status: ${
					costDelta < 0 ? 'PROFIT ✓'
					: costDelta > 0 ? 'LOSS ✗'
					: 'BREAK EVEN'
				}`,
			);
			console.log('=============================');

			// 9. Create fulfillment record with label data
			const fulfillmentId = newId('cartFulfillment');
			const now = new Date();
			const labelExpiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days

			await dbPool(ctx.pool)
				.insert(CartFulfillments)
				.values({
					id: fulfillmentId,
					cartId: cart.id,

					// Shipping info
					shippingCarrier: labelResult.carrier,
					shippingTrackingNumber: labelResult.trackingNumber,

					// ShipStation identifiers
					shipstationLabelId: labelResult.labelId,
					shipstationShipmentId: labelResult.shipmentId,

					// Label details
					labelStatus: 'created',
					labelFormat: labelResult.labelFormat,
					labelDownloadUrl: labelResult.labelDownloadUrl,
					labelExpiresAt,

					// Financial tracking
					labelCostAmount: actualCostCents,
					labelCostCurrency: labelResult.currency,
					estimatedCostAmount: estimatedCostCents,
					estimatedCostCurrency: labelResult.currency,
					costDelta,

					// Package details
					packageWeightOz: input.package.weightOz,
					packageLengthIn: input.package.lengthIn,
					packageWidthIn: input.package.widthIn,
					packageHeightIn: input.package.heightIn,

					// Service details
					serviceCode: labelResult.serviceCode,
					deliveryDays: labelResult.deliveryDays ?? null,

					// Insurance
					insuranceAmount: input.insuranceAmount ?? null,
					insuranceCostAmount: labelResult.insuranceCostCents || null,

					fulfilledAt: now,
				});

			// 10. Link fulfilled products to this fulfillment
			const fulfilledProducts = input.products.filter(p => p.fulfilled);

			await dbPool(ctx.pool)
				.insert(CartFulfillmentProducts)
				.values(
					fulfilledProducts.map(product => ({
						cartFulfillmentId: fulfillmentId,
						productId: product.id,
						apparelSize: product.apparelSize,
					})),
				);

			// 11. Update cart fulfillment status
			const allOrderProductIds = [
				cart.mainProductId,
				cart.addedBump ? cart.bumpProductId : null,
				cart.upsellConvertedAt ? cart.upsellProductId : null,
			].filter(Boolean) as string[];

			const allFulfillments = await dbPool(ctx.pool).query.CartFulfillments.findMany({
				where: eq(CartFulfillments.cartId, cart.id),
				with: {
					products: true,
				},
			});

			const allFulfilledProductIds = allFulfillments.flatMap(f =>
				f.products.map(p => p.productId),
			);

			const fulfillmentStatus =
				allOrderProductIds.every(id => allFulfilledProductIds.includes(id)) ? 'fulfilled'
				:	'partially_fulfilled';

			await dbPool(ctx.pool)
				.update(Carts)
				.set({
					fulfillmentStatus,
					fulfilledAt: fulfillmentStatus === 'fulfilled' ? now : cart.fulfilledAt,
				})
				.where(eq(Carts.id, cart.id));

			// 12. Send tracking email to customer
			const fan = cart.fan;
			if (fan && labelResult.trackingNumber) {
				const orderId = numToPaddedString(cart.orderId ?? 0, { digits: 6 });

				const shippedProducts = fulfilledProducts
					.map(fp => {
						let product: Product | null = null;
						// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
						if (cart.mainProduct && cart.mainProduct.id === fp.id)
							product = cart.mainProduct;
						else if (cart.bumpProduct && cart.bumpProduct.id === fp.id)
							product = cart.bumpProduct;
						else if (cart.upsellProduct && cart.upsellProduct.id === fp.id)
							product = cart.upsellProduct;

						return {
							id: fp.id,
							name: product?.name ?? 'Product',
							apparelSize: fp.apparelSize,
						};
					})
					.filter(p => p.name !== 'Product');

				const ShippingUpdateEmail = ShippingUpdateEmailTemplate({
					orderId,
					date: now,
					sellerName: ctx.workspace.name,
					supportEmail:
						isDevelopment() ? 'adam@barely.ai' : (
							(cart.funnel?.workspace.cartSupportEmail ?? 'support@barely.ai')
						),
					trackingNumber: labelResult.trackingNumber,
					trackingLink: getTrackingLink({
						carrier: labelResult.carrier,
						trackingNumber: labelResult.trackingNumber,
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
					fromFriendlyName: ctx.workspace.name,
					to: isDevelopment() ? `adam+order-${orderId}@barely.ai` : fan.email,
					bcc: [
						'adam@barely.ai',
						...(isDevelopment() ?
							[]
						:	[cart.funnel?.workspace.cartSupportEmail ?? ''].filter(s => s.length > 0)),
					],
					subject: 'Your order has been shipped!',
					type: 'transactional',
					react: ShippingUpdateEmail,
				});
			}

			// 13. Return label info to frontend
			return {
				success: true,
				fulfillmentId,
				labelDownloadUrl: labelResult.labelDownloadUrl,
				trackingNumber: labelResult.trackingNumber,
				carrier: labelResult.carrier,
				estimatedDeliveryDate: labelResult.estimatedDeliveryDate,
				costDelta, // For internal monitoring/logging
			};
		}),
	getLabelForReprint: workspaceProcedure
		.input(z.object({ fulfillmentId: z.string() }))
		.query(async ({ input, ctx }) => {
			const fulfillment = await dbPool(ctx.pool).query.CartFulfillments.findFirst({
				where: eq(CartFulfillments.id, input.fulfillmentId),
				with: {
					cart: {
						columns: {
							workspaceId: true,
						},
					},
				},
			});

			if (!fulfillment || fulfillment.cart?.workspaceId !== ctx.workspace.id) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Fulfillment not found',
				});
			}

			if (fulfillment.labelStatus === 'voided') {
				throw new TRPCError({
					code: 'PRECONDITION_FAILED',
					message: 'This label has been voided and cannot be reprinted',
				});
			}

			// Check if label has expired
			if (fulfillment.labelExpiresAt && new Date() > fulfillment.labelExpiresAt) {
				throw new TRPCError({
					code: 'PRECONDITION_FAILED',
					message: 'This label has expired. Please create a new label.',
				});
			}

			return {
				labelDownloadUrl: fulfillment.labelDownloadUrl,
				trackingNumber: fulfillment.shippingTrackingNumber,
				carrier: fulfillment.shippingCarrier,
				createdAt: fulfillment.createdAt,
			};
		}),
} satisfies TRPCRouterRecord;

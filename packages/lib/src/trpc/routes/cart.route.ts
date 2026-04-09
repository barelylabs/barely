import type { UpdateCart } from '@barely/validators';
import { cookies } from 'next/headers';
import { APPAREL_SIZES, WEB_EVENT_TYPES__CART } from '@barely/const';
import { dbHttp } from '@barely/db/client';
import { dbPool } from '@barely/db/pool';
import { Carts } from '@barely/db/sql/cart.sql';
import { publicProcedure } from '@barely/lib/trpc';
import {
	convertBarelyFeeToWorkspaceCurrency,
	getAbsoluteUrl,
	isProduction,
	newId,
	raiseTRPCError,
	wait,
} from '@barely/utils';
import {
	calculateInitialShippingSchema,
	updateCheckoutCartFromCheckoutSchema,
	updateShippingAddressFromCheckoutSchema,
} from '@barely/validators';
import { tasks } from '@trigger.dev/sdk';
import { TRPCError } from '@trpc/server';
import { waitUntil } from '@vercel/functions';
import { and, eq, notInArray } from 'drizzle-orm';
import { z } from 'zod/v4';

import type { generateFileBlurHash } from '../../trigger/file-blurhash.trigger';
import type { FulfillmentFeeProduct } from '../../utils/fulfillment';
import { getBrandKit } from '../../functions/brand-kit.fns';
import {
	convertShippingAmountIfNeeded,
	createMainCartFromFunnel,
	getCartById,
	getFunnelByParams,
	getProductsShippingRateEstimate,
	getPublicFunnelFromServerFunnel,
	incrementAssetValuesOnCartPurchase,
	sendCartReceiptEmail,
} from '../../functions/cart.fns';
import { recordCartEvent } from '../../functions/event.fns';
import {
	checkProductAvailability,
	decrementProductInventory,
} from '../../functions/inventory.fns';
import { getStripeConnectAccountId } from '../../functions/stripe-connect.fns';
import { stripe } from '../../integrations/stripe';
import { ratelimit } from '../../integrations/upstash';
import {
	getAmountsForCheckout,
	getAmountsForUpsell,
	getFeeAmountForCheckout,
	getVatRateForCheckout,
} from '../../utils/cart';
import {
	calculateDynamicFulfillmentFee,
	getShippingOriginAddress,
	getWorkspaceFulfillmentOverrides,
} from '../../utils/fulfillment';
import { log } from '../../utils/log';

export const cartRoute = {
	brandKitByHandle: publicProcedure
		.input(z.object({ handle: z.string() }))
		.query(async ({ input }) => {
			// Handle system paths that might get caught by dynamic routes
			const systemPaths = ['.well-known', 'appspecific', '_next', 'api'];
			if (systemPaths.includes(input.handle)) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'System path requested',
				});
			}

			const brandKit = await getBrandKit({
				handle: input.handle,
			});

			if (!brandKit) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: `Brand kit not found for handle @${input.handle}`,
				});
			}

			return brandKit;
		}),

	publicFunnelByHandleAndKey: publicProcedure
		.input(z.object({ handle: z.string(), key: z.string() }))
		.query(async ({ input }) => {
			// Handle system paths that might get caught by dynamic routes
			const systemPaths = ['.well-known', 'appspecific', '_next', 'api'];
			if (systemPaths.includes(input.handle)) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'System path requested',
				});
			}

			const funnel =
				(await getFunnelByParams(input.handle, input.key)) ??
				raiseTRPCError({ code: 'NOT_FOUND', message: 'funnel not found' });

			// Trigger blur hash generation if missing (non-blocking)
			if (
				!funnel.mainProduct._images[0]?.file.blurDataUrl &&
				funnel.mainProduct._images[0]?.file.s3Key
			) {
				// Fire and forget - don't await
				waitUntil(
					tasks
						.trigger<typeof generateFileBlurHash>('generate-file-blur-hash', {
							fileId: funnel.mainProduct._images[0].file.id,
							s3Key: funnel.mainProduct._images[0].file.s3Key,
						})
						.catch(error => {
							console.error(
								'Failed to trigger blur hash generation for main product:',
								error,
							);
						}),
				);
			}

			if (
				!funnel.bumpProduct?._images[0]?.file.blurDataUrl &&
				funnel.bumpProduct?._images[0]?.file.s3Key
			) {
				// Fire and forget - don't await
				waitUntil(
					tasks
						.trigger<typeof generateFileBlurHash>('generate-file-blur-hash', {
							fileId: funnel.bumpProduct._images[0].file.id,
							s3Key: funnel.bumpProduct._images[0].file.s3Key,
						})
						.catch(error => {
							console.error(
								'Failed to trigger blur hash generation for bump product:',
								error,
							);
						}),
				);
			}

			if (
				!funnel.upsellProduct?._images[0]?.file.blurDataUrl &&
				funnel.upsellProduct?._images[0]?.file.s3Key
			) {
				// Fire and forget - don't await
				waitUntil(
					tasks
						.trigger<typeof generateFileBlurHash>('generate-file-blur-hash', {
							fileId: funnel.upsellProduct._images[0].file.id,
							s3Key: funnel.upsellProduct._images[0].file.s3Key,
						})
						.catch(error => {
							console.error(
								'Failed to trigger blur hash generation for upsell product:',
								error,
							);
						}),
				);
			}
			return getPublicFunnelFromServerFunnel(funnel);
		}),

	create: publicProcedure
		.input(
			z.object({
				cartId: z.string().optional(),
				handle: z.string(),
				key: z.string(),
				shipTo: z
					.object({
						country: z.string().nullable(),
						state: z.string().nullable(),
						city: z.string().nullable(),
					})
					.optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { handle, key, ...cartParams } = input;
			const funnel = await getFunnelByParams(handle, key);

			if (!funnel) throw new Error('funnel not found');

			const cart = await createMainCartFromFunnel({
				funnel,
				...cartParams,
				cartId: newId('cart'),
				visitor: ctx.visitor ?? null,
			});

			return {
				cart,
				publicFunnel: getPublicFunnelFromServerFunnel(funnel),
			};
		}),

	byIdAndParams: publicProcedure
		.input(
			z.object({
				id: z.string(),
				handle: z.string(),
				key: z.string(),
				waitForCart: z.boolean().optional().default(true),
			}),
		)
		.query(async ({ input }) => {
			let cart = await dbHttp.query.Carts.findFirst({
				where: eq(Carts.id, input.id),
				columns: {
					fulfillmentStatus: false,
					fulfilledAt: false,
					shippingTrackingNumber: false,
					shippedAt: false,
					canceledAt: false,
					refundedAt: false,
					refundedAmount: false,
				},
			});

			if (!cart && input.waitForCart) {
				// Wait for cart creation with reasonable timeout (max ~10 seconds)
				const maxAttempts = 8;
				const baseDelay = 100;
				for (let attempt = 0; attempt < maxAttempts; attempt++) {
					// exponential backoff: 100ms, 200ms, 400ms, 800ms, 1600ms, 3200ms, 6400ms,  (total ~12.7 seconds)
					const delay = baseDelay * Math.pow(2, attempt);
					await wait(delay);
					cart = await dbHttp.query.Carts.findFirst({
						where: eq(Carts.id, input.id),
						columns: {
							fulfillmentStatus: false,
							fulfilledAt: false,
							shippingTrackingNumber: false,
							shippedAt: false,
							canceledAt: false,
							refundedAt: false,
							refundedAmount: false,
						},
					});
					if (cart) break;
				}

				// If cart still doesn't exist after waiting, try to create it
				// if (!cart) {
				// 	const funnel = await getFunnelByParams(input.handle, input.key);
				// 	if (funnel) {
				// 		// Create cart with the existing cart ID from the cookie
				// 		cart = await createMainCartFromFunnel({
				// 			funnel,
				// 			cartId: input.id,
				// 			shipTo: {
				// 				country: cart.shippingAddressCountry,
				// 				state: cart.shippingAddressState,
				// 				city: cart.shippingAddressCity,
				// 			},
				// 			// We don't have visitor info here, but that's okay for recovery
				// 			visitor: null,
				// 		});
				// 	}
				// }
			}

			if (!cart) throw new TRPCError({ code: 'NOT_FOUND', message: 'cart not found' });

			// const funnel = await dbPool(ctx.pool).query.CartFunnels.findFirst({
			// 	where: and(eq(CartFunnels.handle, input.handle), eq(CartFunnels.key, input.key)),
			// 	with: {
			// 		...funnelWith,

			// 		_carts: {
			// 			where: eq(Carts.id, input.id),
			// 			limit: 1,
			// 			columns: {
			// 				fulfillmentStatus: false,
			// 				fulfilledAt: false,
			// 				shippingTrackingNumber: false,
			// 				shippedAt: false,
			// 				canceledAt: false,
			// 				refundedAt: false,
			// 				refundedAmount: false,
			// 			},
			// 		},
			// 	},
			// });

			// if (!funnel) throw new Error('funnel not found');

			// const cart =
			// 	funnel._carts[0] ??
			// 	(await createMainCartFromFunnel({
			// 		funnel,
			// 		cartId: input.id,
			// 		visitor: ctx.visitor ?? null,
			// 	}));

			return {
				cart,
				// publicFunnel: getPublicFunnelFromServerFunnel(funnel),
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

			// Server-side inventory check before payment
			const shippingCountry =
				update.shippingAddressCountry ?? cart.shippingAddressCountry;

			const mainAvailability = await checkProductAvailability({
				productId: funnel.mainProductId,
				apparelSize: cart.mainProductApparelSize,
				shippingCountry,
				workspaceFulfillmentMode: funnel.workspace.barelyFulfillmentMode,
			});

			if (!mainAvailability.available) {
				throw new TRPCError({
					code: 'PRECONDITION_FAILED',
					message: 'This product is currently sold out.',
				});
			}

			if (cart.addedBump && funnel.bumpProductId) {
				const bumpAvailability = await checkProductAvailability({
					productId: funnel.bumpProductId,
					apparelSize: cart.bumpProductApparelSize,
					shippingCountry,
					workspaceFulfillmentMode: funnel.workspace.barelyFulfillmentMode,
				});

				if (!bumpAvailability.available) {
					throw new TRPCError({
						code: 'PRECONDITION_FAILED',
						message: 'The add-on product is currently sold out.',
					});
				}
			}

			const updateCart: UpdateCart = {
				id: cart.id,
				...update,
			};

			// Get the shipping origin based on cart's fulfilledBy (set at creation, immutable)
			const shippingOrigin = getShippingOriginAddress({
				fulfilledBy: cart.fulfilledBy,
				workspace: funnel.workspace,
			});

			const shipFromAddress = {
				state: shippingOrigin.state ?? '',
				postalCode: shippingOrigin.postalCode ?? '',
				countryCode: shippingOrigin.country ?? '',
			};

			if (update.shippingAddressPostalCode) {
				console.log('updating shipping address');
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
					const { lowestShippingPrice: rawMainShippingAmount } =
						await getProductsShippingRateEstimate({
							products: [
								{ product: funnel.mainProduct, quantity: cart.mainProductQuantity },
							],
							shipFrom: shipFromAddress,
							shipTo: {
								country: toCountry,
								state: toState,
								city: toCity,
								postalCode: toPostalCode,
							},
						});

					// Convert shipping from USD to workspace currency if Barely is fulfilling
					const mainShippingAmount = convertShippingAmountIfNeeded(
						rawMainShippingAmount,
						cart.fulfilledBy,
						funnel.workspace.currency,
					);

					updateCart.mainShippingAmount = mainShippingAmount;

					const rawMainPlusBumpShippingPrice =
						!funnel.bumpProduct ? rawMainShippingAmount : (
							await getProductsShippingRateEstimate({
								products: [
									{
										product: funnel.mainProduct,
										quantity: cart.mainProductQuantity,
									},
									{
										product: funnel.bumpProduct,
										quantity: cart.bumpProductQuantity ?? 1,
									},
								],
								shipFrom: shipFromAddress,
								shipTo: {
									postalCode: toPostalCode,
									country: toCountry,
									state: toState,
									city: toCity,
								},
							}).then(({ lowestShippingPrice }) => lowestShippingPrice)
						);

					const mainPlusBumpShippingPrice = convertShippingAmountIfNeeded(
						rawMainPlusBumpShippingPrice,
						cart.fulfilledBy,
						funnel.workspace.currency,
					);

					updateCart.bumpShippingPrice = mainPlusBumpShippingPrice - mainShippingAmount;
				}
			}

			// Use the correct ship-from country for VAT calculation
			const shipFromCountry = shippingOrigin.country;
			const shipToCountry = update.shippingAddressCountry;
			const vat =
				shipFromCountry && shipToCountry ?
					getVatRateForCheckout(shipFromCountry, shipToCountry)
				:	0;

			const amounts = getAmountsForCheckout(
				funnel,
				{
					...cart,
					...updateCart,
				},
				vat,
			);

			// Recalculate fulfillment fees based on current products
			const fulfillmentProducts: FulfillmentFeeProduct[] = [
				{
					merchType: funnel.mainProduct.merchType,
					quantity: updateCart.mainProductQuantity ?? cart.mainProductQuantity,
				},
			];
			const addedBump = update.addedBump ?? cart.addedBump;
			if (addedBump && funnel.bumpProduct) {
				fulfillmentProducts.push({
					merchType: funnel.bumpProduct.merchType,
					quantity: updateCart.bumpProductQuantity ?? cart.bumpProductQuantity ?? 1,
				});
			}

			const fulfillmentBreakdown = calculateDynamicFulfillmentFee({
				fulfilledBy: cart.fulfilledBy,
				products: fulfillmentProducts,
				workspaceOverrides: getWorkspaceFulfillmentOverrides(funnel.workspace),
			});

			// Convert fulfillment fees from USD to workspace currency
			const barelyHandlingFee = convertBarelyFeeToWorkspaceCurrency(
				fulfillmentBreakdown.handlingFee,
				cart.fulfilledBy,
				funnel.workspace.currency,
			);
			const barelyPackagingFee = convertBarelyFeeToWorkspaceCurrency(
				fulfillmentBreakdown.packagingFee,
				cart.fulfilledBy,
				funnel.workspace.currency,
			);
			const barelyPickFee = convertBarelyFeeToWorkspaceCurrency(
				fulfillmentBreakdown.pickFee,
				cart.fulfilledBy,
				funnel.workspace.currency,
			);
			const barelyFulfillmentFee = barelyHandlingFee + barelyPackagingFee + barelyPickFee;

			const { barelyPlatformFee, applicationFeeAmount } = getFeeAmountForCheckout({
				productAmount: amounts.orderProductAmount,
				vatAmount: amounts.orderVatAmount,
				shippingAmount: 0, // not supported yet. in the future we take a shipping fee if they want to ship through the app.
				barelyFulfillmentFee,
				workspace: funnel.workspace,
			});

			const carts = await dbPool(ctx.pool)
				.update(Carts)
				.set({
					...update,
					...amounts,
					barelyPlatformFee,
					barelyFulfillmentFee,
					barelyHandlingFee,
					barelyPackagingFee,
					barelyPickFee,
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

			await stripe.paymentIntents.update(
				stripePaymentIntentId,
				{
					amount: amounts.orderAmount,
					application_fee_amount: applicationFeeAmount,
				},
				{
					stripeAccount:
						stripeAccount ?? raiseTRPCError({ message: 'stripeAccount not found' }),
				},
			);

			return {
				cart: carts[0],
			};
		}),

	updateShippingAddressFromCheckout: publicProcedure
		.input(updateShippingAddressFromCheckoutSchema)
		.mutation(async ({ input, ctx }) => {
			// rate limit this route to prevent abuse of shipping estimate recalculations
			const rateLimit = ratelimit(30, '1 m');
			const { success } = await rateLimit.limit(input.cartId);
			if (!success) {
				throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Too many requests' });
			}

			const { cartId, ...updatedAddress } = input;
			const cart = await getCartById(cartId);
			if (!cart) throw new TRPCError({ code: 'NOT_FOUND', message: 'Cart not found' });

			const funnel = cart.funnel ?? raiseTRPCError({ message: 'funnel not found' });

			const updateCart: UpdateCart = { id: cart.id, ...updatedAddress };

			// if the postal code is the same, we don't need to recalculate shipping rates
			console.log(
				'updatedAddress.shippingAddressPostalCode',
				updatedAddress.shippingAddressPostalCode,
			);
			console.log('cart.shippingAddressPostalCode', cart.shippingAddressPostalCode);

			if (updatedAddress.shippingAddressPostalCode === cart.shippingAddressPostalCode) {
				await dbPool(ctx.pool)
					.update(Carts)
					.set({
						...updateCart,
					})
					.where(eq(Carts.id, cartId))
					.returning();

				return {
					success: true,
				};
			}

			// Get the shipping origin based on cart's fulfilledBy (set at creation, immutable)
			const shippingOrigin = getShippingOriginAddress({
				fulfilledBy: cart.fulfilledBy,
				workspace: funnel.workspace,
			});

			// if the postal code is different, we need to recalculate shipping rates
			const shipFrom = {
				state: shippingOrigin.state ?? '',
				postalCode: shippingOrigin.postalCode ?? '',
				countryCode: shippingOrigin.country ?? '',
			};

			const shipTo = {
				country: updatedAddress.shippingAddressCountry,
				state: updatedAddress.shippingAddressState,
				city: updatedAddress.shippingAddressCity,
				postalCode: updatedAddress.shippingAddressPostalCode,
			};

			const [mainShippingResult, mainPlusBumpShippingResult] = await Promise.all([
				getProductsShippingRateEstimate({
					products: [{ product: funnel.mainProduct, quantity: cart.mainProductQuantity }],
					shipFrom,
					shipTo,
				}),
				!funnel.bumpProduct ?
					Promise.resolve(null)
				:	getProductsShippingRateEstimate({
						products: [
							{ product: funnel.mainProduct, quantity: cart.mainProductQuantity },
							{ product: funnel.bumpProduct, quantity: cart.bumpProductQuantity ?? 1 },
						],
						shipFrom,
						shipTo,
					}),
			]);

			// Convert shipping from USD to workspace currency if Barely is fulfilling
			const mainShippingAmount = convertShippingAmountIfNeeded(
				mainShippingResult.lowestShippingPrice,
				cart.fulfilledBy,
				funnel.workspace.currency,
			);
			const mainPlusBumpShippingPrice =
				!funnel.bumpProduct || !mainPlusBumpShippingResult ?
					mainShippingAmount
				:	convertShippingAmountIfNeeded(
						mainPlusBumpShippingResult.lowestShippingPrice,
						cart.fulfilledBy,
						funnel.workspace.currency,
					);

			updateCart.mainShippingAmount = mainShippingAmount;
			updateCart.bumpShippingPrice = mainPlusBumpShippingPrice - mainShippingAmount;

			// Use the correct ship-from country for VAT calculation
			const amounts = getAmountsForCheckout(
				funnel,
				{
					...cart,
					...updateCart,
				},
				getVatRateForCheckout(
					shippingOrigin.country,
					updatedAddress.shippingAddressCountry,
				),
			);

			await dbPool(ctx.pool)
				.update(Carts)
				.set({
					...updateCart,
					...amounts,
				})
				.where(eq(Carts.id, cartId))
				.returning();

			return {
				success: true,
			};
		}),

	calculateInitialShipping: publicProcedure
		.input(calculateInitialShippingSchema)
		.mutation(async ({ input, ctx }) => {
			const rateLimit = ratelimit(30, '1 m');
			const { success } = await rateLimit.limit(input.cartId);
			if (!success) {
				throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Too many requests' });
			}

			const cart = await getCartById(input.cartId, input.handle, input.key);
			if (!cart) throw new TRPCError({ code: 'NOT_FOUND', message: 'Cart not found' });

			const funnel = cart.funnel ?? raiseTRPCError({ message: 'funnel not found' });

			// Use geo data from the visitor info stored on the cart
			const geo = cart.visitorGeo;
			if (!geo?.country || !geo.region || !geo.city) {
				// No geo data available - shipping will be calculated when user enters address
				return { success: true, calculated: false };
			}

			// Get the shipping origin based on cart's fulfilledBy (set at creation, immutable)
			const shippingOrigin = getShippingOriginAddress({
				fulfilledBy: cart.fulfilledBy,
				workspace: funnel.workspace,
			});

			const shipFrom = {
				state: shippingOrigin.state ?? '',
				postalCode: shippingOrigin.postalCode ?? '',
				countryCode: shippingOrigin.country ?? '',
			};

			const shipTo = {
				country: geo.country,
				state: geo.region,
				city: geo.city,
			};

			try {
				const [mainShippingResult, mainPlusBumpShippingResult] = await Promise.all([
					getProductsShippingRateEstimate({
						products: [
							{ product: funnel.mainProduct, quantity: cart.mainProductQuantity },
						],
						shipFrom,
						shipTo,
					}),
					!funnel.bumpProduct ?
						Promise.resolve(null)
					:	getProductsShippingRateEstimate({
							products: [
								{ product: funnel.mainProduct, quantity: cart.mainProductQuantity },
								{
									product: funnel.bumpProduct,
									quantity: cart.bumpProductQuantity ?? 1,
								},
							],
							shipFrom,
							shipTo,
						}),
				]);

				// Convert shipping from USD to workspace currency if Barely is fulfilling
				const mainShippingAmount = convertShippingAmountIfNeeded(
					mainShippingResult.lowestShippingPrice,
					cart.fulfilledBy,
					funnel.workspace.currency,
				);
				const mainPlusBumpShippingPrice =
					!funnel.bumpProduct || !mainPlusBumpShippingResult ?
						mainShippingAmount
					:	convertShippingAmountIfNeeded(
							mainPlusBumpShippingResult.lowestShippingPrice,
							cart.fulfilledBy,
							funnel.workspace.currency,
						);

				const updateCart: UpdateCart = {
					id: cart.id,
					mainShippingAmount,
					bumpShippingPrice: mainPlusBumpShippingPrice - mainShippingAmount,
				};

				// Use the correct ship-from country for VAT calculation
				const vat = getVatRateForCheckout(shippingOrigin.country, geo.country);

				const amounts = getAmountsForCheckout(funnel, { ...cart, ...updateCart }, vat);

				await dbPool(ctx.pool)
					.update(Carts)
					.set({ ...updateCart, ...amounts })
					.where(eq(Carts.id, cart.id))
					.returning();

				return { success: true, calculated: true };
			} catch (error) {
				console.error('calculateInitialShipping error:', error);
				return { success: false, calculated: false };
			}
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
			let cart =
				(await getCartById(input.cartId)) ??
				raiseTRPCError({ message: 'cart not found' });
			const funnel = cart.funnel ?? raiseTRPCError({ message: 'funnel not found' });

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

			const upsellProduct =
				funnel.upsellProduct ?? raiseTRPCError({ message: 'upsell product not found' });

			// Check upsell product inventory before charging
			const upsellAvailability = await checkProductAvailability({
				productId: upsellProduct.id,
				apparelSize: cart.upsellProductApparelSize,
				shippingCountry: cart.shippingAddressCountry,
				workspaceFulfillmentMode: funnel.workspace.barelyFulfillmentMode,
			});

			if (!upsellAvailability.available) {
				throw new TRPCError({
					code: 'PRECONDITION_FAILED',
					message: 'This product is sold out.',
				});
			}

			const vat = getVatRateForCheckout(
				funnel.workspace.shippingAddressCountry,
				cart.shippingAddressCountry,
			);
			const amounts = getAmountsForUpsell(funnel, cart, vat);

			const fan = cart.fan;

			const stripePaymentMethodId =
				cart.checkoutStripePaymentMethodId ??
				raiseTRPCError({ message: 'stripePaymentMethodId not found' });

			// Recalculate fulfillment fees with all products (main + bump + upsell)
			// to determine the delta from what was already charged at checkout
			const allFulfillmentProducts: FulfillmentFeeProduct[] = [
				{
					merchType: funnel.mainProduct.merchType,
					quantity: cart.mainProductQuantity,
				},
			];
			if (cart.addedBump && funnel.bumpProduct) {
				allFulfillmentProducts.push({
					merchType: funnel.bumpProduct.merchType,
					quantity: cart.bumpProductQuantity ?? 1,
				});
			}
			allFulfillmentProducts.push({
				merchType: upsellProduct.merchType,
				quantity: cart.upsellProductQuantity ?? 1,
			});

			const updatedFulfillment = calculateDynamicFulfillmentFee({
				fulfilledBy: cart.fulfilledBy,
				products: allFulfillmentProducts,
				workspaceOverrides: getWorkspaceFulfillmentOverrides(funnel.workspace),
			});

			// Convert fulfillment fees from USD to workspace currency
			const convertedHandlingFee = convertBarelyFeeToWorkspaceCurrency(
				updatedFulfillment.handlingFee,
				cart.fulfilledBy,
				funnel.workspace.currency,
			);
			const convertedPackagingFee = convertBarelyFeeToWorkspaceCurrency(
				updatedFulfillment.packagingFee,
				cart.fulfilledBy,
				funnel.workspace.currency,
			);
			const convertedPickFee = convertBarelyFeeToWorkspaceCurrency(
				updatedFulfillment.pickFee,
				cart.fulfilledBy,
				funnel.workspace.currency,
			);
			const convertedTotalFee =
				convertedHandlingFee + convertedPackagingFee + convertedPickFee;

			// Only charge Stripe the delta (what wasn't already collected at checkout)
			const upsellFulfillmentFeeDelta = Math.max(
				0,
				convertedTotalFee - cart.barelyFulfillmentFee,
			);

			const { barelyPlatformFee: upsellPlatformFee, applicationFeeAmount } =
				getFeeAmountForCheckout({
					productAmount: amounts.upsellProductAmount,
					vatAmount: amounts.upsellVatAmount,
					shippingAmount: 0, // not supported yet. in the future we take a shipping fee if they want to ship through the app.
					barelyFulfillmentFee: upsellFulfillmentFeeDelta,
					workspace: funnel.workspace,
				});

			const paymentIntentRes = await stripe.paymentIntents.create(
				{
					amount: amounts.upsellAmount,
					application_fee_amount: applicationFeeAmount,
					currency: cart.workspace.currency,
					customer: cart.fan.stripeCustomerId ?? undefined,
					payment_method: stripePaymentMethodId,
					return_url: getAbsoluteUrl(
						'app',
						`/${funnel.workspace.handle}/${funnel.key}/success`,
					),
					confirm: true, // this will immediately attempt to charge the customer
					metadata: {
						paymentType: 'cart',
						cartId: cart.id,
						preChargeCartStage: 'upsellCreated',
					},
				},
				{
					stripeAccount:
						getStripeConnectAccountId(funnel.workspace) ??
						raiseTRPCError({ message: 'stripeAccount not found' }),
				},
			);

			const paymentStatus = paymentIntentRes.status;
			const charge = paymentIntentRes.latest_charge;

			const updateCart: UpdateCart = { id: cart.id };

			updateCart.upsellProductId = upsellProduct.id;
			if (input.apparelSize) updateCart.upsellProductApparelSize = input.apparelSize;
			updateCart.upsellProductAmount = amounts.upsellProductAmount;
			updateCart.upsellShippingAmount = amounts.upsellShippingAmount;
			updateCart.upsellHandlingAmount = amounts.upsellHandlingAmount;
			updateCart.upsellShippingAndHandlingAmount =
				amounts.upsellShippingAndHandlingAmount;
			updateCart.upsellAmount = amounts.upsellAmount;

			updateCart.upsellStripePaymentIntentId = paymentIntentRes.id;
			updateCart.upsellStripeChargeId =
				typeof charge === 'string' ? charge : (charge?.id ?? null);

			updateCart.orderProductAmount =
				cart.mainProductAmount +
				(cart.bumpProductAmount ?? 0) +
				amounts.upsellProductAmount;
			updateCart.orderShippingAmount =
				(cart.mainShippingAmount ?? 0) +
				(cart.bumpShippingAmount ?? 0) +
				amounts.upsellShippingAmount;
			updateCart.orderHandlingAmount =
				(cart.mainHandlingAmount ?? 0) +
				(cart.bumpHandlingAmount ?? 0) +
				amounts.upsellHandlingAmount;
			updateCart.orderShippingAndHandlingAmount =
				(cart.mainShippingAndHandlingAmount ?? 0) +
				(cart.bumpShippingAndHandlingAmount ?? 0) +
				amounts.upsellShippingAndHandlingAmount;
			updateCart.orderVatAmount = (cart.orderVatAmount ?? 0) + amounts.upsellVatAmount;
			updateCart.orderAmount =
				updateCart.orderProductAmount +
				updateCart.orderShippingAndHandlingAmount +
				(updateCart.orderVatAmount ?? 0);

			updateCart.barelyPlatformFee = cart.barelyPlatformFee + upsellPlatformFee;
			updateCart.barelyFulfillmentFee = convertedTotalFee;
			updateCart.barelyHandlingFee = convertedHandlingFee;
			updateCart.barelyPackagingFee = convertedPackagingFee;
			updateCart.barelyPickFee = convertedPickFee;

			updateCart.stage = 'upsellConverted';
			updateCart.upsellConvertedAt = new Date();

			await recordCartEvent({
				cart: {
					...cart,
					...updateCart,
				},
				cartFunnel: funnel,
				type: 'cart/purchaseUpsell',
				visitor: ctx.visitor,
				currency: funnel.workspace.currency,
			}).catch(async err => {
				await log({
					type: 'errors',
					location: 'cart.route.ts::buyUpsell',
					message: `error recording upsell event for cart ${cart.id}: ${String(err)}`,
				});
			});

			await sendCartReceiptEmail({
				...cart,
				...updateCart,
				fan,
				funnel,
				mainProduct: funnel.mainProduct,
				bumpProduct: funnel.bumpProduct,
				upsellProduct: funnel.upsellProduct,
				currency: funnel.workspace.currency,
			}).then(() => {
				updateCart.orderReceiptSent = true;
			});

			await dbPool(ctx.pool)
				.update(Carts)
				.set({
					...updateCart,
					visitorIp: ctx.visitor?.ip,
					visitorGeo: ctx.visitor?.geo,
					visitorUserAgent: ctx.visitor?.userAgent,
				})
				.where(eq(Carts.id, input.cartId));

			await incrementAssetValuesOnCartPurchase(cart, amounts.upsellProductAmount);

			// decrement upsell product inventory
			if (funnel.upsellProductId) {
				await decrementProductInventory({
					productId: funnel.upsellProductId,
					apparelSize: cart.upsellProductApparelSize,
					shippingCountry: cart.shippingAddressCountry,
					workspaceFulfillmentMode: funnel.workspace.barelyFulfillmentMode,
					orderId: String(cart.orderId),
				});
			}

			// 👇 ok because it only happens in a route handler
			(await cookies()).set(
				`${funnel.handle}.${funnel.key}.cartStage`,
				'upsellConverted',
			);

			return {
				handle: funnel.workspace.handle,
				key: funnel.key,
				paymentStatus,
			};
		}),

	declineUpsell: publicProcedure
		.input(z.object({ cartId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			let cart =
				(await getCartById(input.cartId)) ??
				raiseTRPCError({ message: 'cart not found' });

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

			const fan = cart.fan;
			const funnel = cart.funnel ?? raiseTRPCError({ message: 'funnel not found' });

			cart.stage = 'upsellDeclined';

			await recordCartEvent({
				cart,
				cartFunnel: funnel,
				type: 'cart/declineUpsell',
				visitor: ctx.visitor,
				currency: funnel.workspace.currency,
			}).catch(async err => {
				await log({
					type: 'errors',
					location: 'cart.route.ts::declineUpsell',
					message: `error recording decline upsell event for cart ${cart.id}: ${String(err)}`,
				});
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
				currency: funnel.workspace.currency,
			}).then(() => {
				cart.orderReceiptSent = true;
			});

			// console.log('updating declined upsell cart', cart);

			await dbPool(ctx.pool).update(Carts).set(cart).where(eq(Carts.id, input.cartId));

			(await cookies()).set(`${funnel.handle}.${funnel.key}.cartStage`, 'upsellDeclined'); // ok because it only happens in a route handler

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
			const { visitor } = ctx;
			const { cartId, event } = input;

			const cart =
				(await dbPool(ctx.pool).query.Carts.findFirst({
					where: eq(Carts.id, cartId),
					with: {
						funnel: {
							with: {
								workspace: {
									columns: {
										currency: true,
									},
								},
							},
						},
					},
				})) ?? raiseTRPCError({ message: 'cart not found' });

			const cartFunnel = cart.funnel ?? raiseTRPCError({ message: 'funnel not found' });

			if (!visitor?.ip && !cart.visitorIp) {
				console.log(
					`no visitor ip to log cart event [${event}] for cart ${input.cartId}. visitor >> `,
					ctx.visitor,
				);
				return;
			}

			if (ctx.visitor) {
				await dbPool(ctx.pool)
					.update(Carts)
					.set({
						visitorIp: ctx.visitor.ip,
						visitorGeo: ctx.visitor.geo,
						visitorUserAgent: ctx.visitor.userAgent,
						visitorReferer: ctx.visitor.referer,
						visitorRefererUrl: ctx.visitor.referer_url,
						visitorCheckoutHref: ctx.visitor.href,
					})
					.where(eq(Carts.id, cart.id))
					.catch(async err => {
						await log({
							type: 'errors',
							location: 'cart.route.ts::log',
							// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
							message: `Failed to update cart ${cart.id} [${input.event}] with visitor info: ${String(err?.message ?? err).slice(0, 500)} | fieldLengths: ip=${ctx.visitor?.ip.length}, referer_url=${ctx.visitor?.referer_url?.length}, href=${ctx.visitor?.href.length}`,
						});
					});
			}

			await recordCartEvent({
				cart,
				cartFunnel,
				type: event,
				visitor,
				currency: cartFunnel.workspace.currency,
			}).catch(async err => {
				// console.log('error recording cart event in cart.router.log:', err);
				await log({
					type: 'errors',
					location: 'cart.route.ts',
					message: `error recording cart event: ${String(err)}`,
				});
			});

			return {
				success: true,
			};
		}),
};

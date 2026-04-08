import { dbHttp } from '@barely/db/client';
import { ApparelSizes, Carts, Products } from '@barely/db/sql';
import { logger, task } from '@trigger.dev/sdk';
import { and, eq } from 'drizzle-orm';

import { getShopifyClient } from '../integrations/shopify/shopify.fns';
import { createShopifyOrder } from '../integrations/shopify/shopify.orders';
import { log } from '../utils/log';

interface CreateShopifyOrderPayload {
	cartId: string;
}

/**
 * Creates a Shopify order after a barely.cart checkout is fully resolved.
 * Triggered after: checkoutConverted (no upsell), upsellConverted, upsellDeclined, or upsellAbandoned.
 */
export const createShopifyOrderTask = task({
	id: 'create-shopify-order',
	retry: {
		maxAttempts: 3,
		factor: 2,
		minTimeoutInMs: 5000,
		maxTimeoutInMs: 60000,
	},
	run: async (payload: CreateShopifyOrderPayload) => {
		const { cartId } = payload;

		logger.log(`Creating Shopify order for cart ${cartId}`);

		// Fetch the cart with all product relations
		const cart = await dbHttp.query.Carts.findFirst({
			where: eq(Carts.id, cartId),
			with: {
				funnel: {
					with: {
						mainProduct: true,
						bumpProduct: true,
						upsellProduct: true,
						workspace: {
							columns: {
								id: true,
								handle: true,
								currency: true,
							},
						},
					},
				},
			},
		});

		if (!cart) {
			logger.log(`Cart ${cartId} not found, skipping`);
			return;
		}

		if (cart.shopifyOrderId) {
			logger.log(`Cart ${cartId} already has Shopify order ${cart.shopifyOrderId}, skipping`);
			return;
		}

		const funnel = cart.funnel;
		if (!funnel) {
			logger.log(`No funnel for cart ${cartId}, skipping`);
			return;
		}

		// Get Shopify client for the workspace
		const client = await getShopifyClient(funnel.workspace.id);
		if (!client) {
			logger.log(`No Shopify connection for workspace ${funnel.workspace.id}, skipping`);
			return;
		}

		// Build line items from products that have Shopify variant mappings
		const lineItems: Array<{
			variantId: string;
			quantity: number;
			priceSet: {
				shopMoney: { amount: string; currencyCode: string };
			};
		}> = [];

		const currency = (cart.currency ?? funnel.workspace.currency ?? 'usd').toUpperCase();

		// Main product
		if (funnel.mainProduct) {
			const variantId = await resolveShopifyVariantId(
				funnel.mainProduct,
				cart.mainProductApparelSize,
			);
			if (variantId) {
				lineItems.push({
					variantId,
					quantity: cart.mainProductQuantity ?? 1,
					priceSet: {
						shopMoney: {
							amount: ((cart.mainProductPrice ?? funnel.mainProduct.price) / 100).toFixed(2),
							currencyCode: currency,
						},
					},
				});
			}
		}

		// Bump product (only if added)
		if (cart.addedBump && funnel.bumpProduct) {
			const variantId = await resolveShopifyVariantId(
				funnel.bumpProduct,
				cart.bumpProductApparelSize,
			);
			if (variantId) {
				lineItems.push({
					variantId,
					quantity: cart.bumpProductQuantity ?? 1,
					priceSet: {
						shopMoney: {
							amount: ((cart.bumpProductPrice ?? funnel.bumpProduct.price) / 100).toFixed(2),
							currencyCode: currency,
						},
					},
				});
			}
		}

		// Upsell product (only if converted)
		if (cart.stage === 'upsellConverted' && funnel.upsellProduct) {
			const variantId = await resolveShopifyVariantId(
				funnel.upsellProduct,
				cart.upsellProductApparelSize,
			);
			if (variantId) {
				lineItems.push({
					variantId,
					quantity: cart.upsellProductQuantity ?? 1,
					priceSet: {
						shopMoney: {
							amount: ((cart.upsellProductPrice ?? funnel.upsellProduct.price) / 100).toFixed(2),
							currencyCode: currency,
						},
					},
				});
			}
		}

		if (lineItems.length === 0) {
			logger.log(`No Shopify-mapped products for cart ${cartId}, skipping`);
			return;
		}

		// Create the Shopify order
		try {
			const result = await createShopifyOrder(client, {
				lineItems,
				customer: {
					email: cart.email ?? '',
					firstName: cart.firstName ?? undefined,
					lastName: cart.lastName ?? undefined,
				},
				shippingAddress: cart.shippingAddressLine1
					? {
							firstName: cart.firstName ?? undefined,
							lastName: cart.lastName ?? undefined,
							address1: cart.shippingAddressLine1 ?? undefined,
							address2: cart.shippingAddressLine2 ?? undefined,
							city: cart.shippingAddressCity ?? undefined,
							province: cart.shippingAddressState ?? undefined,
							country: cart.shippingAddressCountry ?? undefined,
							zip: cart.shippingAddressPostalCode ?? undefined,
						}
					: undefined,
				currency,
				note: `Order placed via barely.cart - Funnel: ${funnel.name ?? funnel.key}`,
				tags: ['barely-cart', `funnel:${funnel.key}`],
			});

			// Update the cart with Shopify order info and mark as externally fulfilled
			await dbHttp
				.update(Carts)
				.set({
					shopifyOrderId: result.shopifyOrderId,
					shopifyOrderNumber: result.shopifyOrderNumber,
					fulfilledBy: 'shopify',
					fulfillmentStatus: 'fulfilled',
					fulfilledAt: new Date(),
				})
				.where(eq(Carts.id, cartId));

			logger.log(
				`Shopify order ${result.shopifyOrderNumber} created for cart ${cartId}`,
			);
		} catch (error) {
			await log({
				type: 'errors',
				location: 'shopify.trigger.ts::createShopifyOrder',
				message: `Failed to create Shopify order for cart ${cartId}: ${String(error)}`,
			});
			throw error; // Re-throw so Trigger.dev retries
		}
	},
});

/**
 * Resolve the Shopify variant ID for a product, taking into account apparel sizes.
 * For apparel products with a selected size, looks up the ApparelSizes.shopifyVariantId.
 * For non-apparel products, uses Products.shopifyVariantId.
 */
async function resolveShopifyVariantId(
	product: { id: string; shopifyVariantId: string | null },
	apparelSize: string | null | undefined,
): Promise<string | null> {
	// If an apparel size is selected, try to get the size-specific variant
	if (apparelSize) {
		const sizeRow = await dbHttp.query.ApparelSizes.findFirst({
			where: and(
				eq(ApparelSizes.productId, product.id),
				eq(ApparelSizes.size, apparelSize),
			),
		});
		if (sizeRow?.shopifyVariantId) {
			return sizeRow.shopifyVariantId;
		}
	}

	// Fall back to the product-level variant
	return product.shopifyVariantId;
}

import type { ApparelSize } from '@barely/const';
import type { InferSelectModel } from 'drizzle-orm';
import { dbHttp } from '@barely/db/client';
import { ApparelSizes, InventoryAdjustments, Products } from '@barely/db/sql';
import { newId } from '@barely/utils';
import { and, eq, sql } from 'drizzle-orm';

import type { FulfillmentMode } from '../utils/fulfillment';
import { determineFulfillmentResponsibility } from '../utils/fulfillment';

interface DecrementProductInventoryParams {
	productId: string;
	apparelSize?: string | null;
	shippingCountry?: string | null;
	workspaceFulfillmentMode: FulfillmentMode;
	orderId?: string;
}

/**
 * Decrements inventory for a product after a purchase.
 * Determines the correct pool (workspace vs barely) based on fulfillment responsibility.
 * Uses atomic SQL operations to prevent race conditions.
 * Only logs an audit entry if stock actually changed.
 */
export async function decrementProductInventory(params: DecrementProductInventoryParams) {
	const { productId, apparelSize, shippingCountry, workspaceFulfillmentMode, orderId } =
		params;

	// Fetch product to check if inventory is enabled
	const product = await dbHttp.query.Products.findFirst({
		where: eq(Products.id, productId),
	});

	if (!product?.inventoryEnabled) return;

	const fulfilledBy = determineFulfillmentResponsibility({
		workspaceMode: workspaceFulfillmentMode,
		shipToCountry: shippingCountry,
	});

	const pool = fulfilledBy === 'barely' ? 'barely' : 'workspace';
	const reason = orderId ? `Cart order #${orderId}` : 'Cart purchase';

	if (apparelSize) {
		await decrementApparelSizeStock({
			productId,
			apparelSize,
			pool,
			reason,
		});
	} else {
		await decrementProductStock({
			productId,
			pool,
			stockBefore: pool === 'barely' ? (product.barelyStock ?? 0) : (product.stock ?? 0),
			reason,
		});
	}
}

async function decrementProductStock(params: {
	productId: string;
	pool: 'workspace' | 'barely';
	stockBefore: number;
	reason: string;
}) {
	const { productId, pool, stockBefore, reason } = params;
	const column = pool === 'barely' ? Products.barelyStock : Products.stock;

	const result = await dbHttp
		.update(Products)
		.set({
			[pool === 'barely' ? 'barelyStock' : 'stock']:
				sql`GREATEST(COALESCE(${column}, 0) - 1, 0)`,
		})
		.where(eq(Products.id, productId))
		.returning({
			stock: Products.stock,
			barelyStock: Products.barelyStock,
		});

	const updated = result[0];
	if (!updated) return;

	const stockAfter =
		pool === 'barely' ? (updated.barelyStock ?? 0) : (updated.stock ?? 0);

	// Compute actual delta — may be 0 if stock was already at 0
	const actualDelta = stockAfter - stockBefore;
	if (actualDelta === 0) return;

	await dbHttp.insert(InventoryAdjustments).values({
		id: newId('inventoryAdjustment'),
		productId,
		pool,
		delta: actualDelta,
		stockAfter,
		reason,
	});
}

async function decrementApparelSizeStock(params: {
	productId: string;
	apparelSize: string;
	pool: 'workspace' | 'barely';
	reason: string;
}) {
	const { productId, apparelSize: rawApparelSize, pool, reason } = params;
	const apparelSize = rawApparelSize as ApparelSize;
	const column = pool === 'barely' ? ApparelSizes.barelyStock : ApparelSizes.stock;

	// Read current stock before decrement for accurate delta calculation
	const current = await dbHttp.query.ApparelSizes.findFirst({
		where: and(eq(ApparelSizes.productId, productId), eq(ApparelSizes.size, apparelSize)),
		columns: { stock: true, barelyStock: true },
	});

	const stockBefore =
		pool === 'barely' ? (current?.barelyStock ?? 0) : (current?.stock ?? 0);

	const result = await dbHttp
		.update(ApparelSizes)
		.set({
			[pool === 'barely' ? 'barelyStock' : 'stock']:
				sql`GREATEST(COALESCE(${column}, 0) - 1, 0)`,
		})
		.where(and(eq(ApparelSizes.productId, productId), eq(ApparelSizes.size, apparelSize)))
		.returning({
			stock: ApparelSizes.stock,
			barelyStock: ApparelSizes.barelyStock,
		});

	const updated = result[0];
	if (!updated) return;

	const stockAfter =
		pool === 'barely' ? (updated.barelyStock ?? 0) : (updated.stock ?? 0);

	// Compute actual delta — may be 0 if stock was already at 0
	const actualDelta = stockAfter - stockBefore;
	if (actualDelta === 0) return;

	await dbHttp.insert(InventoryAdjustments).values({
		id: newId('inventoryAdjustment'),
		productId,
		apparelSize,
		pool,
		delta: actualDelta,
		stockAfter,
		reason,
	});
}

// Types for pre-fetched product data to avoid redundant DB queries
type ProductWithApparelSizes = InferSelectModel<typeof Products> & {
	_apparelSizes: InferSelectModel<typeof ApparelSizes>[];
};

interface CheckProductAvailabilityParams {
	productId: string;
	apparelSize?: string | null;
	shippingCountry?: string | null;
	workspaceFulfillmentMode: FulfillmentMode;
	/** Pass a pre-fetched product to avoid a redundant DB query */
	product?: ProductWithApparelSizes | null;
}

export interface ProductAvailability {
	available: boolean;
	inventoryEnabled: boolean;
	stock: number | null;
	pool: 'workspace' | 'barely';
}

/**
 * Checks whether a product is available for purchase.
 * Returns availability status based on the correct inventory pool.
 * Accepts an optional pre-fetched product to avoid double DB fetch.
 */
export async function checkProductAvailability(
	params: CheckProductAvailabilityParams,
): Promise<ProductAvailability> {
	const { productId, apparelSize, shippingCountry, workspaceFulfillmentMode } = params;

	const product =
		params.product ??
		(await dbHttp.query.Products.findFirst({
			where: eq(Products.id, productId),
			with: {
				_apparelSizes: true,
			},
		}));

	if (!product) {
		return { available: false, inventoryEnabled: false, stock: null, pool: 'workspace' };
	}

	if (!product.inventoryEnabled) {
		return { available: true, inventoryEnabled: false, stock: null, pool: 'workspace' };
	}

	if (product.allowOverselling) {
		return { available: true, inventoryEnabled: true, stock: null, pool: 'workspace' };
	}

	const fulfilledBy = determineFulfillmentResponsibility({
		workspaceMode: workspaceFulfillmentMode,
		shipToCountry: shippingCountry,
	});

	const pool = fulfilledBy === 'barely' ? 'barely' : 'workspace';

	let stock: number | null;

	if (apparelSize) {
		const sizeRecord = product._apparelSizes.find(s => s.size === apparelSize);
		if (!sizeRecord) {
			// Missing size record = unavailable (prevents purchase without decrement)
			return { available: false, inventoryEnabled: true, stock: 0, pool };
		}
		stock =
			pool === 'barely' ? (sizeRecord.barelyStock ?? null) : (sizeRecord.stock ?? null);
	} else {
		stock = pool === 'barely' ? product.barelyStock : product.stock;
	}

	return {
		available: stock === null || stock > 0,
		inventoryEnabled: true,
		stock,
		pool,
	};
}

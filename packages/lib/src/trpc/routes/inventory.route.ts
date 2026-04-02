import type { ApparelSize } from '@barely/const';
import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { ApparelSizes, InventoryAdjustments, Products } from '@barely/db/sql';
import { newId } from '@barely/utils';
import {
	adjustInventorySchema,
	checkAvailabilitySchema,
	inventoryAdjustmentLogSchema,
} from '@barely/validators';
import { TRPCError } from '@trpc/server';
import { and, desc, eq, lt, sql } from 'drizzle-orm';

import { checkProductAvailability } from '../../functions/inventory.fns';
import { publicProcedure, workspaceProcedure } from '../trpc';

export const inventoryRoute = {
	adjustStock: workspaceProcedure
		.input(adjustInventorySchema)
		.mutation(async ({ input, ctx }) => {
			const { productId, apparelSize, pool, type, value, reason } = input;

			// Only platform admins can adjust Barely inventory
			if (pool === 'barely' && !ctx.user.admin) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'Only platform admins can adjust Barely inventory.',
				});
			}

			// Verify product belongs to workspace
			const product = await dbHttp.query.Products.findFirst({
				where: and(
					eq(Products.id, productId),
					eq(Products.workspaceId, ctx.workspace.id),
				),
			});

			if (!product) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Product not found.',
				});
			}

			if (apparelSize) {
				return adjustApparelSizeStock({
					productId,
					apparelSize,
					pool,
					type,
					value,
					reason,
					adjustedBy: ctx.user.id,
				});
			}

			return adjustProductStock({
				productId,
				pool,
				type,
				value,
				reason,
				adjustedBy: ctx.user.id,
			});
		}),

	adjustmentLog: workspaceProcedure
		.input(inventoryAdjustmentLogSchema)
		.query(async ({ input, ctx }) => {
			const { productId, apparelSize, pool, cursor, limit } = input;

			// Verify product belongs to workspace
			const product = await dbHttp.query.Products.findFirst({
				where: and(
					eq(Products.id, productId),
					eq(Products.workspaceId, ctx.workspace.id),
				),
			});

			if (!product) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Product not found.',
				});
			}

			const conditions = [eq(InventoryAdjustments.productId, productId)];

			if (apparelSize) {
				conditions.push(eq(InventoryAdjustments.apparelSize, apparelSize));
			}

			if (pool) {
				conditions.push(eq(InventoryAdjustments.pool, pool));
			}

			if (cursor) {
				conditions.push(lt(InventoryAdjustments.createdAt, new Date(cursor)));
			}

			const adjustments = await dbHttp.query.InventoryAdjustments.findMany({
				where: and(...conditions),
				orderBy: [desc(InventoryAdjustments.createdAt)],
				limit: limit + 1,
				with: {
					user: {
						columns: {
							id: true,
							fullName: true,
						},
					},
				},
			});

			let nextCursor: string | undefined;
			if (adjustments.length > limit) {
				const last = adjustments.pop();
				nextCursor = last?.createdAt.toISOString();
			}

			return { adjustments, nextCursor };
		}),

	checkAvailability: publicProcedure
		.input(checkAvailabilitySchema)
		.query(async ({ input }) => {
			const { productId, apparelSize, fulfillmentCountry } = input;

			const product = await dbHttp.query.Products.findFirst({
				where: eq(Products.id, productId),
				with: {
					workspace: {
						columns: {
							barelyFulfillmentMode: true,
							barelyFulfillmentEligible: true,
						},
					},
					_apparelSizes: true,
				},
			});

			if (!product) {
				return {
					available: false,
					inventoryEnabled: false,
					stock: null,
					pool: 'workspace' as const,
				};
			}

			return checkProductAvailability({
				productId,
				apparelSize,
				shippingCountry: fulfillmentCountry,
				workspaceFulfillmentMode: product.workspace.barelyFulfillmentMode ?? 'artist_all',
			});
		}),
} satisfies TRPCRouterRecord;

// Internal helpers

async function adjustProductStock(params: {
	productId: string;
	pool: 'workspace' | 'barely';
	type: 'adjust' | 'set';
	value: number;
	reason: string;
	adjustedBy: string;
}) {
	const { productId, pool, type, value, reason, adjustedBy } = params;

	const columnKey = pool === 'barely' ? 'barelyStock' : 'stock';
	const column = pool === 'barely' ? Products.barelyStock : Products.stock;

	let delta: number;

	if (type === 'set') {
		const current = await dbHttp.query.Products.findFirst({
			where: eq(Products.id, productId),
			columns: { stock: true, barelyStock: true },
		});
		const currentStock = (pool === 'barely' ? current?.barelyStock : current?.stock) ?? 0;
		delta = value - currentStock;
	} else {
		delta = value;
	}

	const result = await dbHttp
		.update(Products)
		.set({
			[columnKey]: sql`GREATEST(COALESCE(${column}, 0) + ${delta}, 0)`,
		})
		.where(eq(Products.id, productId))
		.returning({
			stock: Products.stock,
			barelyStock: Products.barelyStock,
		});

	const updated = result[0];
	if (!updated) {
		throw new TRPCError({
			code: 'INTERNAL_SERVER_ERROR',
			message: 'Failed to update stock',
		});
	}

	const stockAfter =
		pool === 'barely' ? (updated.barelyStock ?? 0) : (updated.stock ?? 0);

	await dbHttp.insert(InventoryAdjustments).values({
		id: newId('inventoryAdjustment'),
		productId,
		pool,
		delta,
		stockAfter,
		reason,
		adjustedBy,
	});

	return { stock: updated.stock, barelyStock: updated.barelyStock };
}

async function adjustApparelSizeStock(params: {
	productId: string;
	apparelSize: ApparelSize;
	pool: 'workspace' | 'barely';
	type: 'adjust' | 'set';
	value: number;
	reason: string;
	adjustedBy: string;
}) {
	const { productId, apparelSize, pool, type, value, reason, adjustedBy } = params;

	const columnKey = pool === 'barely' ? 'barelyStock' : 'stock';
	const column = pool === 'barely' ? ApparelSizes.barelyStock : ApparelSizes.stock;

	let delta: number;

	if (type === 'set') {
		const current = await dbHttp.query.ApparelSizes.findFirst({
			where: and(
				eq(ApparelSizes.productId, productId),
				eq(ApparelSizes.size, apparelSize),
			),
			columns: { stock: true, barelyStock: true },
		});
		const currentStock = (pool === 'barely' ? current?.barelyStock : current?.stock) ?? 0;
		delta = value - currentStock;
	} else {
		delta = value;
	}

	const result = await dbHttp
		.update(ApparelSizes)
		.set({
			[columnKey]: sql`GREATEST(COALESCE(${column}, 0) + ${delta}, 0)`,
		})
		.where(and(eq(ApparelSizes.productId, productId), eq(ApparelSizes.size, apparelSize)))
		.returning({
			stock: ApparelSizes.stock,
			barelyStock: ApparelSizes.barelyStock,
		});

	const updated = result[0];
	if (!updated) {
		throw new TRPCError({
			code: 'INTERNAL_SERVER_ERROR',
			message: 'Failed to update apparel size stock',
		});
	}

	const stockAfter =
		pool === 'barely' ? (updated.barelyStock ?? 0) : (updated.stock ?? 0);

	await dbHttp.insert(InventoryAdjustments).values({
		id: newId('inventoryAdjustment'),
		productId,
		apparelSize,
		pool,
		delta,
		stockAfter,
		reason,
		adjustedBy,
	});

	return { stock: updated.stock, barelyStock: updated.barelyStock };
}

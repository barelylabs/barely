import type { InferSelectModel } from 'drizzle-orm';
import { InventoryAdjustments } from '@barely/db/sql';
import { z } from 'zod/v4';

import { apparelSizeSchema } from './product.schema';

export type InventoryAdjustment = InferSelectModel<typeof InventoryAdjustments>;

export const inventoryPoolSchema = z.enum(['workspace', 'barely']);
export type InventoryPool = z.infer<typeof inventoryPoolSchema>;

export const adjustInventorySchema = z.object({
	productId: z.string(),
	apparelSize: apparelSizeSchema.optional(),
	pool: inventoryPoolSchema,
	type: z.enum(['adjust', 'set']),
	value: z.number().int(),
	reason: z.string().min(1).max(500),
});

export type AdjustInventory = z.infer<typeof adjustInventorySchema>;

export const inventoryAdjustmentLogSchema = z.object({
	productId: z.string(),
	apparelSize: apparelSizeSchema.optional(),
	pool: inventoryPoolSchema.optional(),
	cursor: z.string().optional(),
	limit: z.number().int().min(1).max(100).optional().default(50),
});

export const checkAvailabilitySchema = z.object({
	productId: z.string(),
	apparelSize: apparelSizeSchema.optional(),
	fulfillmentCountry: z.string().optional(),
});

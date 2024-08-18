import { z } from 'zod';

import { queryBooleanSchema, queryStringArraySchema } from '../../../utils/zod-helpers';
import { APPAREL_SIZES } from '../product/product.constants';

export const selectWorkspaceCartOrdersSchema = z.object({
	handle: z.string(),
	search: z.string().optional(),
	showArchived: queryBooleanSchema.optional(),
	showFulfilled: queryBooleanSchema.optional().default(false),
	cursor: z
		.object({ orderId: z.coerce.number(), checkoutConvertedAt: z.coerce.date() })
		.optional(),
	limit: z.coerce.number().min(1).max(100).optional().default(20),
});

export const cartOrderFilterParamsSchema = z.object({
	search: z.string().optional(),
	showArchived: queryBooleanSchema.optional(),
	showPending: queryBooleanSchema.optional(),
	showFulfilled: queryBooleanSchema.optional(),
});

export const cartOrderSearchParamsSchema = cartOrderFilterParamsSchema.extend({
	selectedOrderCartIds: z.union([z.literal('all'), queryStringArraySchema]).optional(),
});

/* forms */
export const markCartOrderAsFulfilledSchema = z.object({
	cartId: z.string(),
	products: z.array(
		z.object({
			id: z.string(),
			fulfilled: z.boolean(),
			apparelSize: z.enum(APPAREL_SIZES).optional(),
		}),
	),
	shippingCarrier: z
		.string()
		.min(1)
		.transform(v => (typeof v === 'string' && v.length ? v : undefined))
		.optional(),
	shippingTrackingNumber: z
		.string()
		.min(1)
		.optional()
		.transform(v => (typeof v === 'string' ? v.replace(/\s/g, '') : undefined)),
});

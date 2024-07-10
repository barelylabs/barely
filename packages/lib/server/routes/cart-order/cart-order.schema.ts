import { z } from 'zod';

import { queryStringArraySchema, z_boolean } from '../../../utils/zod-helpers';

export const selectWorkspaceCartOrdersSchema = z.object({
	handle: z.string(),
	search: z.string().optional(),
	showArchived: z_boolean.optional(),
	showFulfilled: z_boolean.optional().default(false),
	cursor: z
		.object({ orderId: z.coerce.number(), checkoutConvertedAt: z.coerce.date() })
		.optional(),
	limit: z.coerce.number().min(1).max(100).optional().default(20),
});

export const cartOrderFilterParamsSchema = z.object({
	search: z.string().optional(),
	showArchived: z_boolean.optional(),
	showPending: z_boolean.optional(),
	showFulfilled: z_boolean.optional(),
});

export const cartOrderSearchParamsSchema = cartOrderFilterParamsSchema.extend({
	selectedOrderCartIds: queryStringArraySchema.optional(),
});

/* forms */
export const markCartOrderAsFulfilledSchema = z.object({
	cartId: z.string(),
	products: z.array(
		z.object({
			id: z.string(),
			fulfilled: z.boolean(),
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

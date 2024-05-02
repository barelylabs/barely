import { z } from 'zod';

import { queryStringArraySchema } from '../../../utils/zod-helpers';

export const selectWorkspaceCartOrdersSchema = z.object({
	handle: z.string(),
	search: z.string().optional(),
	showArchived: z.boolean().optional(),
	cursor: z
		.object({ orderId: z.coerce.number(), checkoutConvertedAt: z.coerce.date() })
		.optional(),
	limit: z.coerce.number().min(1).max(100).optional().default(20),
});

export const cartOrderFilterParamsSchema = z.object({
	search: z.string().optional(),
	showArchived: z.boolean().optional(),
	showPending: z.boolean().optional(),
	showFulfilled: z.boolean().optional(),
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
	shippingCarrier: z.string().optional(),
	shippingTrackingNumber: z.string().optional(),
});

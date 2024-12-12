import { z } from 'zod';

import { commonFiltersSchema, infiniteQuerySchema } from '../../../utils/filters';
import { queryBooleanSchema, queryStringArraySchema } from '../../../utils/zod-helpers';
import { APPAREL_SIZES } from '../product/product.constants';

export const cartOrderFilterParamsSchema = commonFiltersSchema.extend({
	fanId: z.string().optional(),
	showFulfilled: queryBooleanSchema.optional(),
	showPreorders: queryBooleanSchema.optional(),
	showCanceled: queryBooleanSchema.optional(),
});

export const cartOrderSearchParamsSchema = cartOrderFilterParamsSchema.extend({
	selectedOrderCartIds: z.union([z.literal('all'), queryStringArraySchema]).optional(),
});

export const selectWorkspaceCartOrdersSchema = cartOrderFilterParamsSchema
	.merge(infiniteQuerySchema)
	.extend({
		cursor: z
			.object({
				orderId: z.coerce.number(),
				checkoutConvertedAt: z.coerce.date(),
			})
			.optional(),
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

export const cancelCartOrderSchema = z.object({
	cartId: z.string(),
	reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer']),
});

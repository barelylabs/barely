import { APPAREL_SIZES } from '@barely/const';
import { z } from 'zod/v4';

import {
	commonFiltersSchema,
	infiniteQuerySchema,
	queryBooleanSchema,
	queryStringArraySchema,
} from '../helpers';

export const cartOrderFilterParamsSchema = commonFiltersSchema.extend({
	fanId: z.string().optional(),
	showFulfilled: queryBooleanSchema.optional().default(false),
	showPreorders: queryBooleanSchema.optional().default(false),
	showCanceled: queryBooleanSchema.optional().default(false),
});

export const cartOrderSearchParamsSchema = cartOrderFilterParamsSchema.extend({
	selectedOrderCartIds: z.union([z.literal('all'), queryStringArraySchema]).optional(),
});

export const selectWorkspaceCartOrdersSchema = cartOrderFilterParamsSchema
	.extend(infiniteQuerySchema.shape)
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

/* ship order */
export const shipCartOrderSchema = z.object({
	cartId: z.string(),

	// Products to ship in this label (can be partial fulfillment)
	products: z.array(
		z.object({
			id: z.string(),
			fulfilled: z.boolean(),
			apparelSize: z.enum(APPAREL_SIZES).optional(),
		}),
	),

	// Package dimensions (auto-calculated from products)
	package: z.object({
		weightOz: z.number().positive(),
		lengthIn: z.number().positive(),
		widthIn: z.number().positive(),
		heightIn: z.number().positive(),
	}),

	// Optional: allow user to select different service
	// For MVP, we'll use the cheapest by default
	serviceCode: z.string().optional(),

	// Optional: insurance value
	insuranceAmount: z.number().optional(),

	// Optional: delivery confirmation
	deliveryConfirmation: z.enum(['none', 'delivery', 'signature']).default('none'),
});

export const printLabelAgainSchema = z.object({
	fulfillmentId: z.string(),
});

export const voidShippingLabelSchema = z.object({
	fulfillmentId: z.string(),
	reason: z.string().optional(),
});

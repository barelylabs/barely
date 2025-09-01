import type { InferSelectModel } from 'drizzle-orm';
// import { eventReportSearchParamsSchema } from '../event/event-report.schema';
import { Carts } from '@barely/db/sql';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod/v4';

import { cartFiltersSchema } from '../helpers';
import { formattedUserAgentSchema, nextGeoSchema } from './next.schema';
import { stdWebEventPipeQueryParamsSchema } from './tb.schema';

export const insertCartSchema = createInsertSchema(Carts, {
	visitorGeo: nextGeoSchema.optional(),
	visitorUserAgent: formattedUserAgentSchema.optional(),
});

export const createCartSchema = insertCartSchema.omit({ id: true }).partial({
	workspaceId: true,
});

export const updateCartSchema = insertCartSchema.partial().required({ id: true });

export type InsertCart = z.input<typeof insertCartSchema>;
export type CreateCart = z.input<typeof createCartSchema>;
export type UpdateCart = z.input<typeof updateCartSchema>;
export type Cart = InferSelectModel<typeof Carts>;

// query params // on cart page
export const updateFromCartSchema = updateCartSchema.extend({
	handle: z.string(),
	funnelKey: z.string(),
});

export const cartPageSearchParams = insertCartSchema
	.pick({
		id: true,
		email: true,
		firstName: true,
		lastName: true,
		fullName: true,
		phone: true,
		emailMarketingOptIn: true,
		landingPageId: true,
		// client input
		mainProductPayWhatYouWantPrice: true,
		mainProductQuantity: true,
		mainProductApparelSize: true,

		addedBump: true,
		bumpProductQuantity: true,
		bumpProductApparelSize: true,
	})
	.partial()
	.extend({
		warmup: z.coerce.boolean().optional(),
	});

export const updateCheckoutCartFromCheckoutSchema = cartPageSearchParams
	.required({ id: true })
	.extend({
		handle: z.string(),
		key: z.string(),
		shippingAddressLine1: z.string().nullish(),
		shippingAddressLine2: z.string().nullish(),
		shippingAddressCity: z.string().nullish(),
		shippingAddressState: z.string().nullish(),
		shippingAddressPostalCode: z.string().nullish(),
		shippingAddressCountry: z.string().nullish(),
	});

export const updateShippingAddressFromCheckoutSchema = z.object({
	cartId: z.string(),
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	fullName: z.string(),
	phone: z.string().optional(),
	shippingAddressLine1: z.string(),
	shippingAddressLine2: z.string().nullable(),
	shippingAddressCountry: z.string(),
	shippingAddressState: z.string(),
	shippingAddressCity: z.string(),
	shippingAddressPostalCode: z.string(),
});
// stat filters
export const cartStatFiltersSchema = stdWebEventPipeQueryParamsSchema.extend(
	cartFiltersSchema.shape,
);

export type CartStatFilters = z.infer<typeof cartStatFiltersSchema>;

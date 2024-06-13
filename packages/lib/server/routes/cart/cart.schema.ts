import type { InferSelectModel } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

import { formattedUserAgentSchema, nextGeoSchema } from '../../next/next.schema';
import { Carts } from './cart.sql';

export const insertCartSchema = createInsertSchema(Carts, {
	visitorGeo: nextGeoSchema,
	visitorUserAgent: formattedUserAgentSchema,
});

export const createCartSchema = insertCartSchema.omit({ id: true }).partial({
	workspaceId: true,
});

export const updateCartSchema = insertCartSchema.partial().required({ id: true });
// .extend({
// 	visitorGeo: nextGeoSchema,
// 	visitorUserAgent: formattedUserAgentSchema,
// });

export type InsertCart = z.infer<typeof insertCartSchema>;
export type CreateCart = z.input<typeof createCartSchema>;
export type UpdateCart = z.input<typeof updateCartSchema>;
export type Cart = InferSelectModel<typeof Carts>;

// type InsertCartVisitorGeo = InsertCart['visitorGeo'];
// type UpdateCartVisitorGeo = UpdateCart['visitorGeo'];

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
	.partial();

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

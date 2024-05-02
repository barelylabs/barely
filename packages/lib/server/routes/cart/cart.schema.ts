import type { InferSelectModel } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

import { Carts } from './cart.sql';

export const insertCartSchema = createInsertSchema(Carts);
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
		// client input
		mainProductPayWhatYouWantPrice: true,
		mainProductQuantity: true,
		mainProductApparelSize: true,

		addedBump: true,
		bumpProductQuantity: true,
		bumpProductApparelSize: true,
	})
	.partial();

export const updateMainCartFromCartSchema = cartPageSearchParams
	.required({ id: true })
	.extend({
		handle: z.string(),
		funnelKey: z.string(),
		shippingAddressLine1: z.string().nullish(),
		shippingAddressLine2: z.string().nullish(),
		shippingAddressCity: z.string().nullish(),
		shippingAddressState: z.string().nullish(),
		shippingAddressPostalCode: z.string().nullish(),
		shippingAddressCountry: z.string().nullish(),
	});

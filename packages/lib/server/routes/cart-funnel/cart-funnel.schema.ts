import type { InferSelectModel } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

import { queryStringArraySchema } from '../../../utils/zod-helpers';
import { CartFunnels } from './cart-funnel.sql';

export const insertCartFunnelSchema = createInsertSchema(CartFunnels, {
	name: s => s.name.min(1, 'Name is required'),
	key: s => s.key.min(4, 'Key is required'),
	mainProductId: s => s.mainProductId.min(1, 'Main product is required'),
	mainProductPayWhatYouWantMin: s =>
		s.mainProductPayWhatYouWantMin
			.min(0, 'Minimum price must be 0 or greater')
			.max(100000, 'Max price is $1000'),
	mainProductHandling: s =>
		s.mainProductHandling
			.min(0, 'Handling must be 0 or greater')
			.max(100000, 'Max handling is $1000'),
	mainProductDiscount: s =>
		s.mainProductDiscount
			.min(0, 'Discount must be 0 or greater')
			.max(100000, 'Max discount is $1000'),
	bumpProductDiscount: s =>
		s.bumpProductDiscount
			.min(0, 'Discount must be 0 or greater')
			.max(100000, 'Max discount is $1000'),
	upsellProductDiscount: s =>
		s.upsellProductDiscount
			.min(0, 'Discount must be 0 or greater')
			.max(100000, 'Max discount is $1000'),
});
export const createCartFunnelSchema = insertCartFunnelSchema.omit({
	id: true,
	workspaceId: true,
	handle: true,
});
export const upsertCartFunnelSchema = insertCartFunnelSchema.partial({
	id: true,
	workspaceId: true,
	handle: true,
});
export const updateCartFunnelSchema = insertCartFunnelSchema
	.partial()
	.required({ id: true });

export type InsertCartFunnel = z.infer<typeof insertCartFunnelSchema>;
export type CreateCartFunnel = z.infer<typeof createCartFunnelSchema>;
export type UpsertCartFunnel = z.infer<typeof upsertCartFunnelSchema>;
export type UpdateCartFunnel = z.infer<typeof updateCartFunnelSchema>;
export type CartFunnel = InferSelectModel<typeof CartFunnels>;

export const selectWorkspaceCartFunnelsSchema = z.object({
	handle: z.string(),
	search: z.string().optional(),
	showArchived: z.boolean().optional(),
	cursor: z.object({ id: z.string(), createdAt: z.string() }).optional(),
	limit: z.coerce.number().min(1).max(100).optional().default(20),
});

// forms
export const cartFunnelFilterParamsSchema = z.object({
	search: z.string().optional(),
	showArchived: z.boolean().optional(),
});
export const cartFunnelSearchParamsSchema = cartFunnelFilterParamsSchema.extend({
	selectedFunnelIds: queryStringArraySchema.optional(),
});

export const defaultCartFunnel: CreateCartFunnel = {
	name: '',
	key: '',
	mainProductId: '',
	mainProductHandling: 0,
	mainProductDiscount: 0,
	mainProductPayWhatYouWant: false,
	mainProductPayWhatYouWantMin: 0,
	bumpProductId: null,
	bumpProductHeadline: '',
	bumpProductDescription: '',
	bumpProductDiscount: 0,
	upsellProductId: null,
	upsellProductHeadline: '',
	upsellProductAboveTheFold: '',
	upsellProductBelowTheFold: '',
	upsellProductDiscount: 0,
};

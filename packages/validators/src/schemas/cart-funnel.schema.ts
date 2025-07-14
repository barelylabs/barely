import type { InferSelectModel } from 'drizzle-orm';
import type { z } from 'zod/v4';
import { CartFunnels } from '@barely/db/sql';
import { createInsertSchema } from 'drizzle-zod';

import {
	commonFiltersSchema,
	infiniteQuerySchema,
	querySelectionSchema,
} from '../helpers';

export const insertCartFunnelSchema = createInsertSchema(CartFunnels, {
	name: name => name.min(1, 'Name is required'),
	key: key => key.min(4, 'Key is required'),
	mainProductId: mainProductId => mainProductId.min(1, 'Main product is required'),
	mainProductPayWhatYouWantMin: mainProductPayWhatYouWantMin =>
		mainProductPayWhatYouWantMin
			.min(0, 'Minimum price must be 0 or greater')
			.max(100000, 'Max price is $1000'),
	mainProductHandling: mainProductHandling =>
		mainProductHandling
			.min(0, 'Handling must be 0 or greater')
			.max(100000, 'Max handling is $1000'),
	mainProductDiscount: mainProductDiscount =>
		mainProductDiscount
			.min(0, 'Discount must be 0 or greater')
			.max(100000, 'Max discount is $1000'),
	bumpProductDiscount: bumpProductDiscount =>
		bumpProductDiscount
			.min(0, 'Discount must be 0 or greater')
			.max(100000, 'Max discount is $1000'),
	upsellProductDiscount: upsellProductDiscount =>
		upsellProductDiscount
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

export const cartFunnelFilterParamsSchema = commonFiltersSchema;
export const selectWorkspaceCartFunnelsSchema = commonFiltersSchema.extend(
	infiniteQuerySchema.shape,
);

// forms
export const cartFunnelSearchParamsSchema = cartFunnelFilterParamsSchema.extend({
	selectedCartFunnelIds: querySelectionSchema.optional(),
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

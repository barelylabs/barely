import type { InferSelectModel } from 'drizzle-orm';
import { Products } from '@barely/db/sql';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod/v4';

import type { SortableFile } from './file.schema';
import {
	commonFiltersSchema,
	infiniteQuerySchema,
	querySelectionSchema,
} from '../helpers';

const insertProductImagesSchema = z.array(
	z.object({
		fileId: z.string(),
		lexorank: z.string(),
	}),
);

export const apparelSizeSchema = z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL']);
export type ApparelSize = z.infer<typeof apparelSizeSchema>;

export const insertProductSchema = createInsertSchema(Products, {
	name: name => name.min(1, 'Name is required'),
}).extend({
	_images: insertProductImagesSchema.optional(),
	_apparelSizes: z
		.array(
			z.object({
				size: apparelSizeSchema,
				stock: z.number().min(0).max(9999).nullable(),
			}),
		)
		.optional(),
});

export const merchTypeSchema = insertProductSchema.shape.merchType;

export const createProductSchema = insertProductSchema.omit({
	id: true,
	workspaceId: true,
});

export const upsertProductSchema = insertProductSchema.partial({
	id: true,
	workspaceId: true,
	// handle: true,
});
export const updateProductSchema = insertProductSchema.partial().required({ id: true });

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type CreateProduct = z.infer<typeof createProductSchema>;
export type UpsertProduct = z.infer<typeof upsertProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type Product = InferSelectModel<typeof Products>;

export const selectWorkspaceProductsSchema =
	commonFiltersSchema.merge(infiniteQuerySchema);

// forms
export const productFilterParamsSchema = commonFiltersSchema;
export const productSearchParamsSchema = productFilterParamsSchema.extend({
	selectedProductIds: querySelectionSchema.optional(),
});

export const defaultProduct: CreateProduct = {
	name: '',
	price: 0,
	merchType: 'cd',
	_apparelSizes: [],
};

export type NormalizedProductWith_Images = Omit<Product, '_images'> & {
	images: SortableFile[];
	_apparelSizes: { size: ApparelSize; stock: number | null }[];
};

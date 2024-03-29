import type { InferSelectModel } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

import type { SortableFile } from './file.schema';
import { queryStringArraySchema } from '../hooks/use-typed-query';
import { Products } from './product.sql';

const insertProductImagesSchema = z.array(
	z.object({
		fileId: z.string(),
		lexorank: z.string(),
	}),
);

export const apparelSizeSchema = z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL']);
export type ApparelSize = z.infer<typeof apparelSizeSchema>;

export const insertProductSchema = createInsertSchema(Products, {
	name: s => s.name.min(1, 'Name is required'),
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
	handle: true,
});
export const updateProductSchema = insertProductSchema.partial().required({ id: true });

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type CreateProduct = z.infer<typeof createProductSchema>;
export type UpsertProduct = z.infer<typeof upsertProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type Product = InferSelectModel<typeof Products>;

export const selectWorkspaceProductsSchema = z.object({
	handle: z.string(),
	search: z.string().optional(),
	showArchived: z.boolean().optional(),
	cursor: z.object({ id: z.string(), createdAt: z.string() }).optional(),
	limit: z.coerce.number().min(1).max(100).optional().default(20),
});

// forms
export const productFilterParamsSchema = z.object({
	search: z.string().optional(),
	showArchived: z.boolean().optional(),
});
export const productSearchParamsSchema = productFilterParamsSchema.extend({
	selectedProductIds: queryStringArraySchema.optional(),
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

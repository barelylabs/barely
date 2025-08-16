import { BrandKits } from '@barely/db/sql';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod/v4';

// Import color scheme type from bio-themes-v2
export const colorSchemeSchema = z.object({
	colors: z.tuple([z.string(), z.string(), z.string()]),
	mapping: z.object({
		backgroundColor: z.union([z.literal(0), z.literal(1), z.literal(2)]),
		textColor: z.union([z.literal(0), z.literal(1), z.literal(2)]),
		buttonColor: z.union([z.literal(0), z.literal(1), z.literal(2)]),
		buttonTextColor: z.union([z.literal(0), z.literal(1), z.literal(2)]),
		buttonOutlineColor: z.union([z.literal(0), z.literal(1), z.literal(2)]),
		blockColor: z.union([z.literal(0), z.literal(1), z.literal(2)]),
		blockTextColor: z.union([z.literal(0), z.literal(1), z.literal(2)]),
		bannerColor: z.union([z.literal(0), z.literal(1), z.literal(2)]),
	}),
});

export const insertBrandKitSchema = createInsertSchema(BrandKits, {
	colorScheme: colorSchemeSchema,
	themeCategory: z
		.enum(['classic', 'vibrant', 'cozy', 'bold', 'custom'])
		.optional()
		.default('custom'),
});

export const createBrandKitSchema = insertBrandKitSchema.omit({
	id: true,
});

export const updateBrandKitSchema = insertBrandKitSchema.partial().required({ id: true });

export const upsertBrandKitSchema = insertBrandKitSchema.partial({
	id: true,
	workspaceId: true,
});

export const selectBrandKitSchema = createSelectSchema(BrandKits, {
	colorScheme: colorSchemeSchema,
});

// Type exports
export type BrandKit = z.infer<typeof selectBrandKitSchema>;
export type PublicBrandKit = Omit<
	BrandKit,
	'id' | 'createdAt' | 'updatedAt' | 'archivedAt' | 'deletedAt'
>;
export type InsertBrandKit = z.infer<typeof insertBrandKitSchema>;
export type UpdateBrandKit = z.infer<typeof updateBrandKitSchema>;
export type CreateBrandKit = z.infer<typeof createBrandKitSchema>;
export type ColorScheme = z.infer<typeof colorSchemeSchema>;

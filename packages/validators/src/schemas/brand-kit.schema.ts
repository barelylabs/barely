import { BrandKits } from '@barely/db/sql';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod/v4';

// Color index type for cleaner schema definitions
const colorIndexSchema = z.union([z.literal(0), z.literal(1), z.literal(2)]);

// Bio-specific color mapping
export const bioColorSchemeSchema = z.object({
	bgColor: colorIndexSchema,
	textColor: colorIndexSchema,
	blockColor: colorIndexSchema,
	blockTextColor: colorIndexSchema,
	bannerColor: colorIndexSchema,
});

// Cart-specific color mapping
export const cartColorSchemeSchema = z.object({
	bgColor: colorIndexSchema,
	textColor: colorIndexSchema,
	blockColor: colorIndexSchema,
	blockTextColor: colorIndexSchema,
});

// Legacy color scheme (for backwards compatibility)
export const colorSchemeSchema = z.object({
	colors: z.tuple([z.string(), z.string(), z.string()]),
	mapping: z.object({
		backgroundColor: colorIndexSchema,
		textColor: colorIndexSchema,
		buttonColor: colorIndexSchema,
		buttonTextColor: colorIndexSchema,
		buttonOutlineColor: colorIndexSchema,
		blockColor: colorIndexSchema,
		blockTextColor: colorIndexSchema,
		bannerColor: colorIndexSchema,
	}),
});

// OKLCH color string validation
const oklchColorSchema = z
	.string()
	.regex(
		/^oklch\(\s*[\d.]+%?\s+[\d.]+\s+[\d.]+\s*\)$/,
		'Must be a valid OKLCH color string like "oklch(0.55 0.224 28)"',
	);

export const insertBrandKitSchema = createInsertSchema(BrandKits, {
	color1: oklchColorSchema,
	color2: oklchColorSchema,
	color3: oklchColorSchema,
	bioColorScheme: bioColorSchemeSchema,
	cartColorScheme: cartColorSchemeSchema,
	colorScheme: colorSchemeSchema, // Legacy field
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
	color1: oklchColorSchema,
	color2: oklchColorSchema,
	color3: oklchColorSchema,
	bioColorScheme: bioColorSchemeSchema,
	cartColorScheme: cartColorSchemeSchema,
	colorScheme: colorSchemeSchema, // Legacy field
});

// Type exports
export type BioColorScheme = z.infer<typeof bioColorSchemeSchema>;
export type CartColorScheme = z.infer<typeof cartColorSchemeSchema>;
export type ColorScheme = z.infer<typeof colorSchemeSchema>; // Legacy
export type BrandKit = z.infer<typeof selectBrandKitSchema> & {
	workspace?: {
		name: string;
		handle: string;
	};
};
export type PublicBrandKit = Omit<
	BrandKit,
	'id' | 'createdAt' | 'updatedAt' | 'archivedAt' | 'deletedAt'
>;
export type InsertBrandKit = z.infer<typeof insertBrandKitSchema>;
export type UpdateBrandKit = z.infer<typeof updateBrandKitSchema>;
export type CreateBrandKit = z.infer<typeof createBrandKitSchema>;

export const defaultBrandKit: BrandKit = {
	id: 'default',
	createdAt: new Date(),
	updatedAt: new Date(),
	archivedAt: null,
	deletedAt: null,
	workspaceId: 'default',
	handle: 'default',
	avatarS3Key: null,
	avatarBlurDataUrl: null,
	headerS3Key: null,
	headerBlurDataUrl: null,
	themeCategory: 'custom',
	colorPreset: 'default',
	// New color fields
	color1: 'oklch(0.95 0.02 90)', // Light neutral
	color2: 'oklch(0.55 0.18 260)', // Brand blue
	color3: 'oklch(0.20 0.02 90)', // Dark neutral
	bioColorScheme: {
		bgColor: 0, // Light background
		textColor: 2, // Dark text
		blockColor: 1, // Brand blocks
		blockTextColor: 0, // Light text on blocks
		bannerColor: 1, // Brand banner
	},
	cartColorScheme: {
		bgColor: 0, // Light background
		textColor: 2, // Dark text
		blockColor: 1, // Brand accents
		blockTextColor: 0, // Light text on blocks
	},
	// Legacy field for backwards compatibility
	colorScheme: {
		colors: ['oklch(0.95 0.02 90)', 'oklch(0.55 0.18 260)', 'oklch(0.20 0.02 90)'],
		mapping: {
			backgroundColor: 0,
			textColor: 2,
			buttonColor: 1,
			buttonTextColor: 0,
			buttonOutlineColor: 2,
			blockColor: 1,
			blockTextColor: 0,
			bannerColor: 1,
		},
	},
	fontPreset: 'modern.cal',
	headingFont: 'modern.cal',
	bodyFont: 'modern.cal',
	blockStyle: 'full-width',
	shortBio: null,
	longBio: null,
	location: null,
	blockShadow: false,
	blockOutline: false,
	workspace: {
		name: 'Default',
		handle: 'default',
	},
};

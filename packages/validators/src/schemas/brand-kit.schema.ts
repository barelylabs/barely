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

export const selectBrandKitSchema = z.object({
	id: z.string(),
	workspaceId: z.string(),

	// Bio content
	longBio: z.string().nullish(),
	shortBio: z.string().nullish(),
	location: z.string().nullish(),

	// Theme & Design System
	themeKey: z.string().nullish(),
	themeCategory: z.enum(['classic', 'vibrant', 'cozy', 'bold']).nullish(),

	// Appearance/Colors
	appearancePreset: z.string().nullish(),
	colorScheme: colorSchemeSchema.nullish(), // Color scheme object

	// Typography
	fontPreset: z
		.enum([
			// Modern fonts
			'modern.cal',
			'modern.montserrat',
			'modern.bowlbyOne',
			'modern.anton',
			// Classic fonts
			'classic.playfairDisplay',
			'classic.playfairDisplaySc',
			'classic.cutive',
			'classic.libreBaskerville',
			// Creative fonts
			'creative.fredokaOne',
			'creative.yellowtail',
			'creative.permanentMarker',
			'creative.pacifico',
			// Logo fonts
			'logo.coda',
			'logo.miriamLibre',
			'logo.rammettoOne',
			'logo.gravitasOne',
			// Futuristic fonts
			'futuristic.museoModerno',
			'futuristic.audiowide',
			'futuristic.lexendZetta',
			'futuristic.unicaOne',
			// Custom
			'custom',
		])
		.default('modern.cal'),
	headingFont: z.string().nullish(),
	bodyFont: z.string().nullish(),

	// Block/Button Styling
	blockStyle: z.enum(['rounded', 'oval', 'square', 'full-width']).default('rounded'),
	blockShadow: z.boolean().default(false),
	blockOutline: z.boolean().default(false),

	createdAt: z.date(),
	updatedAt: z.date(),
});

export const insertBrandKitSchema = selectBrandKitSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});

export const updateBrandKitSchema = selectBrandKitSchema
	.omit({
		createdAt: true,
		updatedAt: true,
	})
	.partial()
	.required({ id: true });

export const createBrandKitSchema = insertBrandKitSchema;

// Utility schemas
export const brandKitByWorkspaceSchema = z.object({
	workspaceId: z.string(),
});

// Type exports
export type BrandKit = z.infer<typeof selectBrandKitSchema>;
export type InsertBrandKit = z.infer<typeof insertBrandKitSchema>;
export type UpdateBrandKit = z.infer<typeof updateBrandKitSchema>;
export type CreateBrandKit = z.infer<typeof createBrandKitSchema>;
export type ColorScheme = z.infer<typeof colorSchemeSchema>;

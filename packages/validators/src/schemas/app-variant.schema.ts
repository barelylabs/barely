import { APPS } from '@barely/const';
import { z } from 'zod/v4';

// App variant schema - matches APPS constant
export const appVariantSchema = z.enum(APPS);
export type AppVariant = z.infer<typeof appVariantSchema>;

// App feature schema - features available in different app variants
export const appFeatureSchema = z.enum([
	'analytics',
	'bio-pages',
	'campaigns',
	'fan-group',
	'fans',
	'files',
	'fm',
	'forms',
	'link',
	'links',
	'mailchimp',
	'media',
	'mixtapes',
	'playlists',
	'press-kits',
	'products',
	'settings',
	'team',
	'tracks',
	'videos',
	'workspace',
]);
export type AppFeature = z.infer<typeof appFeatureSchema>;

// App variant configuration schema
export const appVariantConfigSchema = z.object({
	name: z.string(),
	displayName: z.string(),
	baseUrl: z.string().url().or(z.string()),
	features: z.array(appFeatureSchema),
});
export type AppVariantConfig = z.infer<typeof appVariantConfigSchema>;

// Navigation group schema - for filtering navigation items
export const navigationGroupSchema = z.enum(['main', 'tools', 'settings', 'workspace']);
export type NavigationGroup = z.infer<typeof navigationGroupSchema>;

// Navigation item schema
export const navigationItemSchema = z.object({
	name: z.string(),
	href: z.string(),
	icon: z.string().optional(),
	feature: appFeatureSchema.optional(),
	group: navigationGroupSchema.optional(),
	badge: z.string().optional(),
	disabled: z.boolean().optional(),
});
export type NavigationItem = z.infer<typeof navigationItemSchema>;

// Navigation structure schema
export const navigationStructureSchema = z.object({
	main: z.array(navigationItemSchema),
	tools: z.array(navigationItemSchema).optional(),
	settings: z.array(navigationItemSchema).optional(),
});
export type NavigationStructure = z.infer<typeof navigationStructureSchema>;

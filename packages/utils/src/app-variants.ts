import type { APPS } from '@barely/const';

export type AppVariant = (typeof APPS)[number];

export interface AppVariantConfig {
	name: string;
	displayName: string;
	baseUrl: string;
	features: AppFeature[];
}

export type AppFeature =
	| 'analytics'
	| 'bio-pages'
	| 'campaigns'
	| 'fan-group'
	| 'fans'
	| 'files'
	| 'fm'
	| 'forms'
	| 'link'
	| 'links'
	| 'mailchimp'
	| 'media'
	| 'mixtapes'
	| 'playlists'
	| 'press-kits'
	| 'products'
	| 'settings'
	| 'team'
	| 'tracks'
	| 'videos'
	| 'workspace';

// Map of app variants to their configurations
export const APP_VARIANT_CONFIGS: Record<string, AppVariantConfig> = {
	app: {
		name: 'app',
		displayName: 'barely.ai',
		baseUrl: 'app.barely.ai',
		features: [
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
		],
	},
	appFm: {
		name: 'appFm',
		displayName: 'barely.fm',
		baseUrl: 'app.barely.fm',
		features: ['fm', 'media', 'settings', 'workspace'],
	},
};

/**
 * Get the current app variant from environment
 */
export function getCurrentAppVariant(): AppVariant | undefined {
	if (typeof window === 'undefined') {
		// Server-side: read from process.env
		return process.env.NEXT_PUBLIC_CURRENT_APP as AppVariant | undefined;
	}
	// Client-side: read from window (Next.js will inject NEXT_PUBLIC_ vars)
	return process.env.NEXT_PUBLIC_CURRENT_APP as AppVariant | undefined;
}

/**
 * Get configuration for the current app variant
 */
export function getCurrentAppConfig(): AppVariantConfig {
	const variant = getCurrentAppVariant();

	// Default to full app if no variant specified
	if (!variant || !(variant in APP_VARIANT_CONFIGS)) {
		const appConfig = APP_VARIANT_CONFIGS.app;
		if (!appConfig) {
			throw new Error('Default app configuration not found');
		}
		return appConfig;
	}

	const variantConfig = APP_VARIANT_CONFIGS[variant];
	if (!variantConfig) {
		// Fallback to default app config for unknown variants
		const appConfig = APP_VARIANT_CONFIGS.app;
		if (!appConfig) {
			throw new Error('Default app configuration not found');
		}
		return appConfig;
	}

	return variantConfig;
}

/**
 * Check if current app variant has a specific feature
 */
export function hasFeature(feature: AppFeature): boolean {
	const config = getCurrentAppConfig();
	return config.features.includes(feature);
}

/**
 * Get all enabled features for current app variant
 */
export function getEnabledFeatures(): AppFeature[] {
	const config = getCurrentAppConfig();
	return config.features;
}

/**
 * Check if the current app is a specific variant
 */
export function isAppVariant(variant: AppVariant): boolean {
	const currentVariant = getCurrentAppVariant();
	return currentVariant === variant;
}

/**
 * Check if we're running the FM-focused variant
 */
export function isFmVariant(): boolean {
	return isAppVariant('appFm');
}

/**
 * Check if we're running the full app (no variant specified)
 */
export function isFullApp(): boolean {
	const variant = getCurrentAppVariant();
	return !variant || variant === 'app';
}

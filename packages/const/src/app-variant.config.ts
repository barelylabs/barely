import type { APPS } from './app.constants';

export type AppVariant = (typeof APPS)[number];

export interface AppVariantConfig {
	name: string;
	displayName: string;
	title: string;
	description?: string;
	emailFromName: string;
	logoUrl: string;
	logoAlt: string;
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
	| 'invoices'
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
		title: 'barely.ai',
		description: 'The marketing stack for creators',
		emailFromName: 'Barely',
		logoUrl: '/_static/logo.png',
		logoAlt: 'barely.ai logo',
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
			'invoices',
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
		title: 'barely.fm',
		description: 'Your music distribution platform',
		emailFromName: 'Barely FM',
		logoUrl: '/_static/logo.png',
		logoAlt: 'barely.fm logo',
		baseUrl: 'app.barely.fm',
		features: ['fm', 'media', 'settings', 'workspace'],
	},
	appInvoice: {
		name: 'appInvoice',
		displayName: 'Barely Invoice',
		title: 'Barely Invoice',
		description: 'Simple invoicing for creators',
		emailFromName: 'Barely Invoice',
		logoUrl: '/_static/logo.png',
		logoAlt: 'Barely Invoice logo',
		baseUrl: 'app.barely.invoice',
		features: ['invoices', 'settings', 'workspace'],
	},
};

/**
 * Get the current app variant from environment
 */
export function getCurrentAppVariant(): AppVariant | undefined {
	// Both server and client can read from process.env in Next.js
	// NEXT_PUBLIC_ variables are injected at build time
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

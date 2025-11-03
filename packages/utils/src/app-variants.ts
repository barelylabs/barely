// Helper functions built on top of core config
import type { AppFeature, AppVariant } from '@barely/const';
import { getCurrentAppConfig, getCurrentAppVariant } from '@barely/const';

// Re-export core types and functions from @barely/const
export type { AppVariant, AppVariantConfig, AppFeature } from '@barely/const';

export {
	APP_VARIANT_CONFIGS,
	getCurrentAppVariant,
	getCurrentAppConfig,
} from '@barely/const';

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
 * Check if we're running the invoice-focused variant
 */
export function isInvoiceVariant(): boolean {
	return isAppVariant('appInvoice');
}

/**
 * Check if we're running the full app (no variant specified)
 */
export function isFullApp(): boolean {
	const variant = getCurrentAppVariant();
	return variant === 'app';
}

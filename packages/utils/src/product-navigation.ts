import type { AppVariant } from './app-variants';
import type { Product } from './products';
import { getCurrentAppConfig, getCurrentAppVariant } from './app-variants';
import { CORE_PRODUCTS, META_PRODUCTS } from './products';

/**
 * Get products filtered by app variant features
 * This is used by the product sidebar to determine which products to show
 */
export function getProductsForVariant(variant?: AppVariant): {
	core: Product[];
	meta: Product[];
	locked: Product[];
} {
	const currentVariant = variant ?? getCurrentAppVariant();

	// Handle specific variants with custom product sets
	if (currentVariant === 'appFm') {
		const fmProduct = CORE_PRODUCTS.find(p => p.id === 'fm');
		const mediaProduct = META_PRODUCTS.find(p => p.id === 'media');

		return {
			core: fmProduct ? [fmProduct] : [],
			meta: mediaProduct ? [mediaProduct] : [],
			locked: CORE_PRODUCTS.filter(p => p.id !== 'fm'),
		};
	}

	if (currentVariant === 'appInvoice') {
		const invoiceProduct = CORE_PRODUCTS.find(p => p.id === 'invoices');

		return {
			core: invoiceProduct ? [invoiceProduct] : [],
			meta: [], // No meta products for invoice variant
			locked: CORE_PRODUCTS.filter(p => p.id !== 'invoices'),
		};
	}

	// For full app or unknown variant, show all products based on features
	const config = getCurrentAppConfig();
	const features = config.features;

	const core: Product[] = [];
	const meta: Product[] = [];
	const locked: Product[] = [];

	// Filter core products
	for (const product of CORE_PRODUCTS) {
		if (
			!product.requiredFeatures ||
			product.requiredFeatures.every(f => features.includes(f))
		) {
			core.push(product);
		} else {
			locked.push(product);
		}
	}

	// Filter meta products
	for (const product of META_PRODUCTS) {
		if (
			!product.requiredFeatures ||
			product.requiredFeatures.some(f => features.includes(f))
		) {
			meta.push(product);
		}
	}

	return { core, meta, locked };
}

/**
 * Check if a specific product should be shown for the current app variant
 */
export function shouldShowProduct(productId: string, variant?: AppVariant): boolean {
	const { core, meta } = getProductsForVariant(variant);
	return [...core, ...meta].some(p => p.id === productId);
}

/**
 * Get the default product for the current app variant
 */
export function getDefaultProductForVariant(variant?: AppVariant): Product | undefined {
	const currentVariant = variant ?? getCurrentAppVariant();

	// Handle specific variants
	if (currentVariant === 'appFm') {
		return CORE_PRODUCTS.find(p => p.id === 'fm');
	}

	if (currentVariant === 'appInvoice') {
		return CORE_PRODUCTS.find(p => p.id === 'invoices');
	}

	// For full app, return the first available core product
	const { core } = getProductsForVariant(variant);
	return core[0];
}

/**
 * Get settings routes filtered by app variant features
 * This is used by the context sidebar when showing settings
 */
export function getSettingsRoutesForVariant(variant?: AppVariant): {
	path: string;
	label: string;
	icon?: string;
}[] {
	const currentVariant = variant ?? getCurrentAppVariant();
	const config = getCurrentAppConfig();
	const features = config.features;

	// Base settings available to all variants
	const baseSettings = [
		{ path: '/settings', label: 'profile', icon: 'profile' },
		{ path: '/settings/billing', label: 'billing', icon: 'billing' },
	];

	// For FM variant, only show essential settings
	if (currentVariant === 'appFm') {
		return baseSettings;
	}

	// For Invoice variant, include payouts for Stripe Connect
	if (currentVariant === 'appInvoice') {
		const profile = baseSettings[0];
		const billing = baseSettings[1];
		const result: { path: string; label: string; icon?: string }[] = [];

		if (profile) result.push(profile);
		result.push({ path: '/settings/payouts', label: 'payouts', icon: 'payouts' });
		if (billing) result.push(billing);

		return result;
	}

	// For full app, add feature-gated settings
	const allSettings = [...baseSettings];

	if (features.includes('team')) {
		allSettings.push({ path: '/settings/team', label: 'team', icon: 'users' });
	}

	if (features.includes('settings')) {
		allSettings.push(
			{ path: '/settings/brand', label: 'brand', icon: 'brand' },
			{ path: '/settings/socials', label: 'socials', icon: 'socials' },
			{ path: '/settings/streaming', label: 'streaming', icon: 'music' },
			{ path: '/settings/apps', label: 'apps', icon: 'apps' },
			{ path: '/settings/domains', label: 'domains', icon: 'domain' },
			{ path: '/settings/remarketing', label: 'remarketing', icon: 'remarketing' },
			{ path: '/settings/payouts', label: 'payouts', icon: 'payouts' },
		);
	}

	if (features.includes('campaigns')) {
		allSettings.push({ path: '/settings/vip', label: 'vip', icon: 'vip' });
	}

	if (features.includes('products')) {
		allSettings.push({ path: '/settings/cart', label: 'cart', icon: 'cart' });
	}

	// Email settings with nested structure
	if (features.includes('settings')) {
		// Note: The context sidebar handles the nested structure
		// We just need to include the parent route here
		allSettings.push({
			path: '/settings/email/domains',
			label: 'email',
			icon: 'email',
		});
	}

	return allSettings;
}

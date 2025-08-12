import type { AppFeature, AppVariant } from './app-variants';
import { getCurrentAppConfig, getCurrentAppVariant } from './app-variants';

export interface NavLink {
	title: string;
	href?: string;
	icon?: string;
	disabled?: boolean;
	external?: boolean;
	label?: string;
	feature?: AppFeature;
}

export interface NavGroup {
	title: string;
	icon?: string;
	href?: string;
	links: NavLink[];
	feature?: AppFeature;
	hideLinksWhenNotActive?: boolean;
}

export type NavItem = NavLink | NavGroup;

// Map navigation items to required features
const NAVIGATION_FEATURE_MAP: Record<string, AppFeature> = {
	// Media/Content
	media: 'media',
	tracks: 'tracks',
	mixtapes: 'mixtapes',

	// Destinations/Pages
	links: 'links',
	fm: 'fm',
	pages: 'bio-pages',
	press: 'press-kits',
	vip: 'campaigns',

	// Merch
	products: 'products',
	carts: 'products',
	orders: 'products',

	// Email
	templates: 'forms',
	'template groups': 'forms',

	// Fans
	fans: 'fans',
	'fan groups': 'fan-group',

	// Other
	flows: 'analytics',
	settings: 'settings',

	// Settings items
	profile: 'settings',
	team: 'team',
	teams: 'team',
	socials: 'settings',
	streaming: 'settings',
	apps: 'settings',
	email: 'settings',
	domains: 'settings',
	remarketing: 'settings',
	payouts: 'settings',
	billing: 'settings',
	cart: 'products',
};

/**
 * Check if a navigation item should be shown for the current app variant
 */
function shouldShowNavItem(item: NavLink | NavGroup, features: AppFeature[]): boolean {
	// If item explicitly defines a feature, check if it's enabled
	if (item.feature) {
		return features.includes(item.feature);
	}

	// Otherwise, check by title mapping
	const requiredFeature = NAVIGATION_FEATURE_MAP[item.title.toLowerCase()];
	if (requiredFeature) {
		return features.includes(requiredFeature);
	}

	// If no feature mapping found, show it (backward compatibility)
	return true;
}

/**
 * Filter navigation links based on enabled features
 */
function filterNavLinks(links: NavLink[], features: AppFeature[]): NavLink[] {
	return links.filter(link => shouldShowNavItem(link, features));
}

/**
 * Filter navigation groups based on enabled features
 */
function filterNavGroup(group: NavGroup, features: AppFeature[]): NavGroup | null {
	// First check if the group itself should be shown
	if (!shouldShowNavItem(group, features)) {
		return null;
	}

	// Filter the links within the group
	const filteredLinks = filterNavLinks(group.links, features);

	// If no links remain after filtering, hide the group
	if (filteredLinks.length === 0) {
		return null;
	}

	return {
		...group,
		links: filteredLinks,
	};
}

/**
 * Filter navigation items based on current app variant
 */
export function filterNavigationForApp(items: NavItem[]): NavItem[] {
	const config = getCurrentAppConfig();
	const features = config.features;

	const filtered: NavItem[] = [];

	for (const item of items) {
		// Check if this is a group or a link
		if ('links' in item) {
			// It's a group
			const filteredGroup = filterNavGroup(item, features);
			if (filteredGroup) {
				filtered.push(filteredGroup);
			}
		} else {
			// It's a link
			if (shouldShowNavItem(item, features)) {
				filtered.push(item);
			}
		}
	}

	return filtered;
}

/**
 * Get navigation configuration for a specific app variant
 */
export function getNavigationForApp(variant?: AppVariant): NavItem[] {
	const currentVariant = variant ?? getCurrentAppVariant();

	// Define complete navigation structure
	const fullNavigation: NavItem[] = [
		{
			title: 'content',
			links: [
				{ title: 'media', icon: 'media' },
				{ title: 'tracks', icon: 'music' },
				{ title: 'mixtapes', icon: 'mixtape' },
			],
		},
		{
			title: 'destinations',
			links: [
				{ title: 'links', icon: 'link' },
				{ title: 'fm', icon: 'fm' },
				{ title: 'pages', icon: 'landingPage' },
				{ title: 'press', icon: 'press' },
				{ title: 'vip', icon: 'vip' },
			],
		},
		{
			title: 'merch',
			links: [
				{ title: 'products', icon: 'product' },
				{ title: 'carts', icon: 'cartFunnel' },
				{ title: 'orders', icon: 'order' },
			],
		},
		{
			title: 'email',
			links: [
				{ title: 'templates', icon: 'email' },
				{ title: 'template groups', icon: 'emailTemplateGroup' },
			],
		},
		{
			title: 'fans',
			links: [
				{ title: 'fans', icon: 'fans' },
				{ title: 'fan groups', icon: 'fanGroup' },
			],
		},
		{
			title: 'other',
			links: [
				{ title: 'flows', icon: 'flow' },
				{ title: 'settings', icon: 'settings' },
			],
		},
	];

	// For FM variant, return only FM-relevant navigation
	if (currentVariant === 'appFm') {
		return [
			{
				title: 'fm',
				icon: 'fm',
				links: [],
			},
			{
				title: 'content',
				links: [{ title: 'media', icon: 'media' }],
			},
			{
				title: 'other',
				links: [{ title: 'settings', icon: 'settings' }],
			},
		];
	}

	// For full app or unknown variant, return complete navigation
	return fullNavigation;
}

/**
 * Get settings navigation for current app variant
 */
export function getSettingsNavigationForApp(): NavLink[] {
	const config = getCurrentAppConfig();
	const features = config.features;

	const allSettingsLinks: NavLink[] = [
		{ title: 'profile', icon: 'profile' },
		{ title: 'team', icon: 'users' },
		{ title: 'socials', icon: 'socials' },
		{ title: 'streaming', icon: 'music' },
		{ title: 'apps', icon: 'apps' },
		{ title: 'email', icon: 'email' },
		{ title: 'domains', icon: 'domain' },
		{ title: 'remarketing', icon: 'remarketing' },
		{ title: 'vip', icon: 'vip' },
		{ title: 'cart', icon: 'cart' },
		{ title: 'payouts', icon: 'payouts' },
		{ title: 'billing', icon: 'billing' },
	];

	// For FM variant, only show essential settings
	if (getCurrentAppVariant() === 'appFm') {
		return [
			{ title: 'profile', icon: 'profile' },
			{ title: 'billing', icon: 'billing' },
		];
	}

	return filterNavLinks(allSettingsLinks, features);
}

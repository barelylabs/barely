import type { AppFeature } from './app-variants';

export type ProductType = 'core' | 'meta';

export interface ProductRoute {
	path: string;
	label: string;
	icon?: string;
	children?: ProductRoute[];
	requiredFeature?: AppFeature;
	group?: string;
}

export interface Product {
	id: string;
	name: string;
	icon: string;
	type: ProductType;
	description?: string;
	requiredFeatures?: AppFeature[];
	routes: ProductRoute[];
	defaultRoute: string;
	lockedMessage?: string;
	monetization?: 'subscription' | 'usage' | 'percentage';
}

// Core products that can be standalone apps
export const CORE_PRODUCTS: Product[] = [
	{
		id: 'fm',
		name: 'FM',
		icon: 'fm',
		type: 'core',
		description: 'Streaming smart links',
		requiredFeatures: ['fm'],
		defaultRoute: '/fm',
		routes: [
			{
				path: '/fm',
				label: 'FM Pages',
				icon: 'fm',
			},
			{
				path: '/fm/stats',
				label: 'Analytics',
				icon: 'stat',
			},
		],
	},
	{
		id: 'links',
		name: 'Links',
		icon: 'link',
		type: 'core',
		description: 'URL shortener with analytics',
		requiredFeatures: ['links'],
		defaultRoute: '/links',
		routes: [
			{
				path: '/links',
				label: 'My Links',
				icon: 'link',
			},
			{
				path: '/links/stats',
				label: 'Analytics',
				icon: 'stat',
			},
		],
	},
	{
		id: 'pages',
		name: 'Pages',
		icon: 'landingPage',
		type: 'core',
		description: 'Easy landing pages',
		requiredFeatures: ['bio-pages'],
		defaultRoute: '/pages',
		routes: [
			{
				path: '/pages',
				label: 'Pages',
				icon: 'landingPage',
			},
			{
				path: '/pages/stats',
				label: 'Analytics',
				icon: 'stat',
			},
		],
	},
	{
		id: 'vip',
		name: 'VIP',
		icon: 'vip',
		type: 'core',
		description: 'Fan experiences & email-gated swaps',
		requiredFeatures: ['campaigns'],
		defaultRoute: '/vip/swaps',
		routes: [
			{
				path: '/vip/swaps',
				label: 'Swaps',
				icon: 'vip',
			},
			{
				path: '/vip/swaps/stats',
				label: 'Analytics',
				icon: 'stat',
			},
		],
	},
	{
		id: 'press',
		name: 'Press',
		icon: 'press',
		type: 'core',
		description: 'Electronic press kit (EPK)',
		requiredFeatures: ['press-kits'],
		defaultRoute: '/press',
		routes: [
			{
				path: '/press',
				label: 'Press Kit',
				icon: 'press',
			},
		],
	},
];

// Meta products that enhance core products
export const META_PRODUCTS: Product[] = [
	{
		id: 'merch',
		name: 'Merch',
		icon: 'product',
		type: 'meta',
		description: 'Sell products to your fans',
		requiredFeatures: ['products'],
		defaultRoute: '/products',
		monetization: 'percentage',
		routes: [
			{
				path: '/products',
				label: 'Products',
				icon: 'product',
			},
			{
				path: '/carts',
				label: 'Carts',
				icon: 'cartFunnel',
			},
			{
				path: '/orders',
				label: 'Orders',
				icon: 'order',
			},
			{
				path: '/carts/stats',
				label: 'Analytics',
				icon: 'stat',
				group: 'Insights',
			},
		],
	},
	{
		id: 'email',
		name: 'Email',
		icon: 'email',
		type: 'meta',
		description: 'Reach your audience directly',
		requiredFeatures: ['forms'],
		defaultRoute: '/email-templates',
		monetization: 'usage',
		routes: [
			{
				path: '/email-templates',
				label: 'Templates',
				icon: 'email',
			},
			{
				path: '/email-template-groups',
				label: 'Campaigns',
				icon: 'emailTemplateGroup',
			},
		],
	},
	{
		id: 'flows',
		name: 'Flows',
		icon: 'flow',
		type: 'meta',
		description: 'Automate your workflow',
		requiredFeatures: ['analytics'],
		defaultRoute: '/flows',
		monetization: 'usage',
		routes: [
			{
				path: '/flows',
				label: 'My Flows',
				icon: 'flow',
			},
		],
	},
	{
		id: 'fans',
		name: 'Fans',
		icon: 'fans',
		type: 'meta',
		description: 'Understand your audience',
		requiredFeatures: ['fans'],
		defaultRoute: '/fans',
		routes: [
			{
				path: '/fans',
				label: 'All Fans',
				icon: 'fans',
			},
			{
				path: '/fan-groups',
				label: 'Groups',
				icon: 'fanGroup',
			},
		],
	},

	{
		id: 'media',
		name: 'Media',
		icon: 'media',
		type: 'meta',
		description: 'Asset library',
		requiredFeatures: ['media'],
		defaultRoute: '/media',
		routes: [
			{
				path: '/media',
				label: 'Library',
				icon: 'media',
			},
			{
				path: '/tracks',
				label: 'Tracks',
				icon: 'music',
			},
			{
				path: '/tracks/stats',
				label: 'Analytics',
				icon: 'stat',
			},
			{
				path: '/mixtapes',
				label: 'Mixtapes',
				icon: 'mixtape',
			},
		],
	},
];

export const ALL_PRODUCTS = [...CORE_PRODUCTS, ...META_PRODUCTS];

/**
 * Get product by ID
 */
export function getProductById(id: string): Product | undefined {
	return ALL_PRODUCTS.find(p => p.id === id);
}

/**
 * Get products available for current app variant
 */
export function getAvailableProducts(features: AppFeature[]): {
	core: Product[];
	meta: Product[];
	locked: Product[];
} {
	const core: Product[] = [];
	const meta: Product[] = [];
	const locked: Product[] = [];

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
 * Get routes for a specific product filtered by features
 */
export function getProductRoutes(
	productId: string,
	features: AppFeature[],
): ProductRoute[] {
	const product = getProductById(productId);
	if (!product) return [];

	// Filter routes based on required features
	return product.routes.filter(route => {
		if (!route.requiredFeature) return true;
		return features.includes(route.requiredFeature);
	});
}

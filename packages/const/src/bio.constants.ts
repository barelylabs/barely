export const BIO_IMG_SHAPES = ['square', 'circle', 'rounded'] as const;
export type BioImgShape = (typeof BIO_IMG_SHAPES)[number];

export const BIO_IMG_MOBILE_SIDE = ['top', 'bottom'] as const;
export type BioImgMobileSide = (typeof BIO_IMG_MOBILE_SIDE)[number];

export const BIO_IMG_DESKTOP_SIDE = ['left', 'right'] as const;
export type BioImgDesktopSide = (typeof BIO_IMG_DESKTOP_SIDE)[number];

export const BIO_HEADER_STYLE_CATEGORIES = [
	'minimal',
	'banner',
	'portrait',
	'shapes',
] as const;

export type BioHeaderStyleCategory = (typeof BIO_HEADER_STYLE_CATEGORIES)[number];

export const BIO_HEADER_STYLES = [
	'minimal.centered',
	'minimal.left',
	'minimal.hero',
	'minimal.shapes',
] as const;

export type BioHeaderStyle = (typeof BIO_HEADER_STYLES)[number];

// Bio Block Types
export const BIO_BLOCK_TYPES = [
	'links',
	'contactForm',
	'cart',
	'fm',
	'bio',
	// 'url',
	'markdown',
	'image',
	'twoPanel',
] as const;

export type BioBlockType = (typeof BIO_BLOCK_TYPES)[number];

export const BIO_BLOCK_ANIMATION_TYPES = [
	'none',
	'bounce',
	'jello',
	'wobble',
	'pulse',
	'shake',
	'tada',
] as const;

export type BioBlockAnimationType = (typeof BIO_BLOCK_ANIMATION_TYPES)[number];

export const BIO_BLOCK_ANIMATION_OPTIONS = [
	{ value: 'none', label: 'NONE', animationClass: '' },
	{ value: 'bounce', label: 'BOUNCE', animationClass: 'animate-bio-bounce' },
	{ value: 'jello', label: 'JELLO', animationClass: 'animate-bio-jello' },
	{ value: 'wobble', label: 'WOBBLE', animationClass: 'animate-bio-wiggle' },
	{ value: 'pulse', label: 'PULSE', animationClass: 'animate-bio-pulse' },
	{ value: 'shake', label: 'SHAKE', animationClass: 'animate-bio-shake' },
	{ value: 'tada', label: 'TADA', animationClass: 'animate-bio-tada' },
] as const;

export const BIO_BLOCK_ICON_TYPES = [
	'none',
	'cart',
	'bag',
	'sparkles',
	'arrow',
	'star',
	'heart',
	'gift',
] as const;

export type BioBlockIcon = (typeof BIO_BLOCK_ICON_TYPES)[number];

export const BIO_BLOCK_ICON_OPTIONS = [
	{ value: 'none', label: 'NONE', icon: null },
	{ value: 'cart', label: 'CART', icon: 'shoppingCart' },
	{ value: 'bag', label: 'BAG', icon: 'shoppingBag' },
	{ value: 'sparkles', label: 'SPARKLES', icon: 'sparkles' },
	{ value: 'arrow', label: 'ARROW', icon: 'arrowRight' },
	{ value: 'star', label: 'STAR', icon: 'star' },
	{ value: 'heart', label: 'HEART', icon: 'heart' },
	{ value: 'gift', label: 'GIFT', icon: 'gift' },
] as const;

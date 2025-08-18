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

export const MERCH_TYPES = [
	'cd',
	'vinyl',
	'cassette',
	// apparel
	'tshirt',
	'sweatshirt',
	// prints
	'sticker',
	'poster',
	'print',
	// digital
	'digital',
] as const;
export type MerchType = (typeof MERCH_TYPES)[number];

export const MEDIAMAIL_TYPES: MerchType[] = ['cd', 'vinyl', 'cassette'] as const;
export type MediaMailType = (typeof MEDIAMAIL_TYPES)[number];

export const APPAREL_TYPES: MerchType[] = ['tshirt', 'sweatshirt'] as const;
export type ApparelType = (typeof APPAREL_TYPES)[number];

export function isMerchType(type: string): type is MerchType {
	return MERCH_TYPES.includes(type as MerchType);
}
export function isApparelType(type: string): type is ApparelType {
	return APPAREL_TYPES.includes(type as ApparelType);
}

export const MERCH_DIMENSIONS: Record<
	MerchType,
	{ weight: number; width: number; length: number; height: number }
> = {
	cd: { weight: 4, width: 5, length: 5, height: 0.5 },
	vinyl: { weight: 16, width: 12.375, length: 12.375, height: 0.25 },
	cassette: { weight: 4, width: 4, length: 2.75, height: 0.75 },
	tshirt: { weight: 6, width: 8, length: 10, height: 1 },
	sweatshirt: { weight: 12, width: 12, length: 12, height: 1 },
	sticker: { weight: 0.1, width: 3, length: 3, height: 0.1 },
	poster: { weight: 0.1, width: 19, length: 3, height: 3 },
	print: { weight: 0.1, width: 12, length: 12, height: 0.1 },
	digital: { weight: 0, width: 0, length: 0, height: 0 },
};

export const MERCH_CUSTOMS_DESCRIPTIONS: Record<MerchType, string> = {
	cd: 'Compact Disc',
	vinyl: 'Vinyl Record',
	cassette: 'Cassette Tape',
	tshirt: 'Cotton T-Shirt',
	sweatshirt: 'Cotton Sweatshirt',
	sticker: 'Sticker',
	poster: 'Paper Poster',
	print: 'Art Print',
	digital: 'Digital Product',
};

export const MERCH_HS_CODES: Record<MerchType, string> = {
	cd: '8523.49',
	vinyl: '8523.80',
	cassette: '8523.29',
	tshirt: '6109.10',
	sweatshirt: '6110.20',
	sticker: '4911.91',
	poster: '4911.91',
	print: '4911.91',
	digital: '',
};

export const APPAREL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;
export type ApparelSize = (typeof APPAREL_SIZES)[number];
export function isApparelSize(size: string): size is ApparelSize {
	return APPAREL_SIZES.includes(size as ApparelSize);
}

import type { MerchType } from './product.constants';

// Mailer types used for packaging fee calculation
export const MAILER_TYPES = [
	'cd_cassette',
	'poly_bag',
	'poster_tube',
	'lp_single',
	'lp_double',
] as const;
export type MailerType = (typeof MAILER_TYPES)[number];

// All amounts in cents
export const DEFAULT_FULFILLMENT_HANDLING_FEE = 250; // $2.50 per order
export const DEFAULT_FULFILLMENT_PICK_FEE_PER_EXTRA_ITEM = 25; // $0.25 per extra item

export const DEFAULT_FULFILLMENT_PACKAGING_FEES: Record<MailerType, number> = {
	cd_cassette: 50, // $0.50
	poly_bag: 50, // $0.50
	poster_tube: 100, // $1.00
	lp_single: 200, // $2.00
	lp_double: 250, // $2.50
};

/**
 * Maps each MerchType to its base mailer type.
 * null = no physical mailer needed (e.g. digital).
 *
 * Note: Vinyl uses lp_single by default. The actual mailer is determined
 * dynamically based on vinyl quantity in the order (1 = lp_single, 2+ = lp_double).
 */
export const MERCH_TYPE_TO_MAILER: Record<MerchType, MailerType | null> = {
	cd: 'cd_cassette',
	cassette: 'cd_cassette',
	vinyl: 'lp_single', // upgraded to lp_double when qty > 1
	tshirt: 'poly_bag',
	sweatshirt: 'poly_bag',
	sticker: 'cd_cassette',
	poster: 'poster_tube',
	print: 'poster_tube',
	digital: null,
};

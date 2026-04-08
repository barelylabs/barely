import type { MailerType, MerchType } from '@barely/const';
import type { Workspace } from '@barely/validators/schemas';
import {
	DEFAULT_FULFILLMENT_HANDLING_FEE,
	DEFAULT_FULFILLMENT_PACKAGING_FEES,
	DEFAULT_FULFILLMENT_PICK_FEE_PER_EXTRA_ITEM,
	MERCH_TYPE_TO_MAILER,
} from '@barely/const';

import { getBarelyFulfillmentAddress } from '../../env';

export type FulfillmentMode = 'artist_all' | 'barely_us' | 'barely_worldwide';
export type FulfilledBy = 'artist' | 'barely' | 'shopify';

export interface ShippingAddress {
	name?: string | null;
	line1: string | null;
	line2?: string | null;
	city: string | null;
	state: string | null;
	postalCode: string | null;
	country: string | null;
	phone?: string | null;
}

/**
 * Determines who is responsible for fulfilling an order based on the workspace's
 * fulfillment mode and the customer's shipping destination.
 *
 * @param params.workspaceMode - The workspace's fulfillment mode setting
 * @param params.shipToCountry - The customer's shipping country (ISO 2-letter code)
 * @returns 'artist' or 'barely' indicating who should fulfill the order
 */
export function determineFulfillmentResponsibility(params: {
	workspaceMode: FulfillmentMode;
	shipToCountry: string | null | undefined;
}): FulfilledBy {
	const { workspaceMode, shipToCountry } = params;

	// Artist handles all orders
	if (workspaceMode === 'artist_all') {
		return 'artist';
	}

	// Barely handles all orders worldwide
	if (workspaceMode === 'barely_worldwide') {
		return 'barely';
	}

	// Barely handles US orders only (workspaceMode === 'barely_us')
	// Normalize country code and check if it's US
	const normalizedCountry = shipToCountry?.toUpperCase().trim();
	if (normalizedCountry === 'US' || normalizedCountry === 'USA') {
		return 'barely';
	}

	// Non-US orders are fulfilled by artist
	return 'artist';
}

/**
 * Returns the appropriate shipping origin address based on who is fulfilling the order.
 *
 * @param params.fulfilledBy - Who is fulfilling the order ('artist' or 'barely')
 * @param params.workspace - The workspace with shipping address fields
 * @returns The shipping origin address to use for rate calculation
 */
export function getShippingOriginAddress(params: {
	fulfilledBy: FulfilledBy;
	workspace: Pick<
		Workspace,
		| 'shippingAddressLine1'
		| 'shippingAddressLine2'
		| 'shippingAddressCity'
		| 'shippingAddressState'
		| 'shippingAddressPostalCode'
		| 'shippingAddressCountry'
		| 'shippingAddressPhone'
	>;
}): ShippingAddress {
	const { fulfilledBy, workspace } = params;

	if (fulfilledBy === 'barely') {
		return getBarelyFulfillmentAddress();
	}

	// Return artist's workspace shipping address
	return {
		line1: workspace.shippingAddressLine1,
		line2: workspace.shippingAddressLine2,
		city: workspace.shippingAddressCity,
		state: workspace.shippingAddressState,
		postalCode: workspace.shippingAddressPostalCode,
		country: workspace.shippingAddressCountry,
		phone: workspace.shippingAddressPhone,
	};
}

/**
 * Calculates the fulfillment fee that Barely charges for handling fulfillment.
 *
 * @param params.fulfilledBy - Who is fulfilling the order
 * @param params.productAmountInCents - The total product amount in cents
 * @param params.flatFeeInCents - The flat fee per order in cents (null = no flat fee)
 * @param params.percentageFee - The percentage fee × 100 (e.g., 500 = 5%, null = no percentage fee)
 * @returns The fulfillment fee in cents
 */
export function calculateBarelyFulfillmentFee(params: {
	fulfilledBy: FulfilledBy;
	productAmountInCents: number;
	flatFeeInCents: number | null;
	percentageFee: number | null;
}): number {
	const { fulfilledBy, productAmountInCents, flatFeeInCents, percentageFee } = params;

	// No fee if artist is fulfilling
	if (fulfilledBy === 'artist') {
		return 0;
	}

	// No fee if neither fee type is configured
	if (flatFeeInCents === null && percentageFee === null) {
		return 0;
	}

	const flatAmount = flatFeeInCents ?? 0;
	const percentageAmount =
		percentageFee !== null ?
			Math.round(productAmountInCents * (percentageFee / 10000))
		:	0;

	return flatAmount + percentageAmount;
}

// --- Dynamic fulfillment fee calculation ---

export interface FulfillmentFeeBreakdown {
	handlingFee: number; // cents
	packagingFee: number; // cents
	pickFee: number; // cents
	totalFee: number; // cents
}

export interface FulfillmentFeeProduct {
	merchType: MerchType;
	quantity: number;
}

export interface FulfillmentFeeOverrides {
	handlingFee?: number | null;
	pickFeePerExtraItem?: number | null;
	packagingFees?: Partial<Record<MailerType, number | null>>;
}

const ZERO_BREAKDOWN: FulfillmentFeeBreakdown = Object.freeze({
	handlingFee: 0,
	packagingFee: 0,
	pickFee: 0,
	totalFee: 0,
});

/**
 * Extracts fulfillment fee override settings from a workspace record.
 */
export function getWorkspaceFulfillmentOverrides(
	workspace: Pick<
		Workspace,
		| 'barelyFulfillmentHandlingFeeOverride'
		| 'barelyFulfillmentPickFeeOverride'
		| 'barelyFulfillmentPackagingCdCassetteFeeOverride'
		| 'barelyFulfillmentPackagingPolyBagFeeOverride'
		| 'barelyFulfillmentPackagingPosterTubeFeeOverride'
		| 'barelyFulfillmentPackagingLpSingleFeeOverride'
		| 'barelyFulfillmentPackagingLpDoubleFeeOverride'
	>,
): FulfillmentFeeOverrides {
	return {
		handlingFee: workspace.barelyFulfillmentHandlingFeeOverride,
		pickFeePerExtraItem: workspace.barelyFulfillmentPickFeeOverride,
		packagingFees: {
			cd_cassette: workspace.barelyFulfillmentPackagingCdCassetteFeeOverride,
			poly_bag: workspace.barelyFulfillmentPackagingPolyBagFeeOverride,
			poster_tube: workspace.barelyFulfillmentPackagingPosterTubeFeeOverride,
			lp_single: workspace.barelyFulfillmentPackagingLpSingleFeeOverride,
			lp_double: workspace.barelyFulfillmentPackagingLpDoubleFeeOverride,
		},
	};
}

/**
 * Resolves the effective mailer type for a product, accounting for vinyl quantity.
 * Vinyl with qty > 1 upgrades from lp_single to lp_double.
 */
function resolveMailerType(merchType: MerchType, quantity: number): MailerType | null {
	const baseMailer = MERCH_TYPE_TO_MAILER[merchType];
	if (baseMailer === 'lp_single' && quantity > 1) {
		return 'lp_double';
	}
	return baseMailer;
}

/**
 * Gets the packaging fee for a mailer type, using workspace override if set.
 */
function getPackagingFeeForMailer(
	mailerType: MailerType,
	overrides?: FulfillmentFeeOverrides,
): number {
	const override = overrides?.packagingFees?.[mailerType];
	return typeof override === 'number' ? override : (
			DEFAULT_FULFILLMENT_PACKAGING_FEES[mailerType]
		);
}

/**
 * Calculates itemized fulfillment fees based on the actual products in an order.
 *
 * Fee components:
 * - Handling: flat fee per order ($2.50 default)
 * - Packaging: based on the most expensive mailer needed (largest mailer wins)
 * - Pick: $0.25 per extra item (first unit free)
 *
 * Vinyl quantity determines mailer: 1 = lp_single ($2.00), 2+ = lp_double ($2.50)
 */
export function calculateDynamicFulfillmentFee(params: {
	fulfilledBy: FulfilledBy;
	products: FulfillmentFeeProduct[];
	workspaceOverrides?: FulfillmentFeeOverrides;
}): FulfillmentFeeBreakdown {
	const { fulfilledBy, products, workspaceOverrides } = params;

	if (fulfilledBy === 'artist') {
		return ZERO_BREAKDOWN;
	}

	// Filter to physical products only (digital has null mailer)
	const physicalProducts = products.filter(
		p => MERCH_TYPE_TO_MAILER[p.merchType] !== null && p.quantity > 0,
	);

	if (physicalProducts.length === 0) {
		return ZERO_BREAKDOWN;
	}

	// Handling fee
	const handlingFee =
		typeof workspaceOverrides?.handlingFee === 'number' ?
			workspaceOverrides.handlingFee
		:	DEFAULT_FULFILLMENT_HANDLING_FEE;

	// Packaging fee: find the most expensive mailer across all products
	let packagingFee = 0;
	for (const product of physicalProducts) {
		const mailerType = resolveMailerType(product.merchType, product.quantity);
		if (mailerType === null) continue;
		const fee = getPackagingFeeForMailer(mailerType, workspaceOverrides);
		if (fee > packagingFee) {
			packagingFee = fee;
		}
	}

	// Pick fee: first unit free, $0.25 per additional unit
	const totalQuantity = physicalProducts.reduce((sum, p) => sum + p.quantity, 0);
	const extraItems = Math.max(totalQuantity - 1, 0);
	const pickFeePerItem =
		typeof workspaceOverrides?.pickFeePerExtraItem === 'number' ?
			workspaceOverrides.pickFeePerExtraItem
		:	DEFAULT_FULFILLMENT_PICK_FEE_PER_EXTRA_ITEM;
	const pickFee = extraItems * pickFeePerItem;

	const totalFee = handlingFee + packagingFee + pickFee;

	return { handlingFee, packagingFee, pickFee, totalFee };
}

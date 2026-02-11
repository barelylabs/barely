import type { Workspace } from '@barely/validators/schemas';

import { getBarelyFulfillmentAddress } from '../../env';

export type FulfillmentMode = 'artist_all' | 'barely_us' | 'barely_worldwide';
export type FulfilledBy = 'artist' | 'barely';

export interface ShippingAddress {
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

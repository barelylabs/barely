import { convertFulfillmentAmountIfNeeded } from '@barely/utils';
import { describe, expect, it } from 'vitest';

import type { FulfillmentFeeOverrides, FulfillmentFeeProduct } from '../fulfillment';
import { calculateDynamicFulfillmentFee } from '../fulfillment';

describe('calculateDynamicFulfillmentFee', () => {
	const defaults = {
		fulfilledBy: 'barely' as const,
		products: [] as FulfillmentFeeProduct[],
	};

	it('returns all zeros when artist is fulfilling', () => {
		const result = calculateDynamicFulfillmentFee({
			fulfilledBy: 'artist',
			products: [{ merchType: 'vinyl', quantity: 1 }],
		});
		expect(result).toEqual({
			handlingFee: 0,
			packagingFee: 0,
			pickFee: 0,
			totalFee: 0,
		});
	});

	it('returns all zeros for digital-only orders', () => {
		const result = calculateDynamicFulfillmentFee({
			...defaults,
			products: [{ merchType: 'digital', quantity: 1 }],
		});
		expect(result).toEqual({
			handlingFee: 0,
			packagingFee: 0,
			pickFee: 0,
			totalFee: 0,
		});
	});

	it('1 vinyl + 1 digital = no pick fee for the digital item', () => {
		const result = calculateDynamicFulfillmentFee({
			fulfilledBy: 'barely',
			products: [
				{ merchType: 'vinyl', quantity: 1 },
				{ merchType: 'digital', quantity: 1 },
			],
		});
		// Only 1 physical item; first unit is free → pick fee should be 0
		expect(result.pickFee).toBe(0);
		expect(result.totalFee).toBe(450); // $2.50 handling + $2.00 lp_single
	});

	// Example orders from the pricing page:

	it('1 CD = $3.00 (handling $2.50 + packaging $0.50)', () => {
		const result = calculateDynamicFulfillmentFee({
			...defaults,
			products: [{ merchType: 'cd', quantity: 1 }],
		});
		expect(result).toEqual({
			handlingFee: 250,
			packagingFee: 50,
			pickFee: 0,
			totalFee: 300,
		});
	});

	it('1 CD + sticker pack = $3.25 (handling $2.50 + packaging $0.50 + pick $0.25)', () => {
		const result = calculateDynamicFulfillmentFee({
			...defaults,
			products: [
				{ merchType: 'cd', quantity: 1 },
				{ merchType: 'sticker', quantity: 1 },
			],
		});
		expect(result).toEqual({
			handlingFee: 250,
			packagingFee: 50, // cd_cassette mailer is the largest
			pickFee: 25, // 2 items total - 1 free = 1 extra
			totalFee: 325,
		});
	});

	it('1 t-shirt = $3.00 (handling $2.50 + packaging $0.50)', () => {
		const result = calculateDynamicFulfillmentFee({
			...defaults,
			products: [{ merchType: 'tshirt', quantity: 1 }],
		});
		expect(result).toEqual({
			handlingFee: 250,
			packagingFee: 50,
			pickFee: 0,
			totalFee: 300,
		});
	});

	it('1 vinyl LP = $4.50 (handling $2.50 + packaging $2.00)', () => {
		const result = calculateDynamicFulfillmentFee({
			...defaults,
			products: [{ merchType: 'vinyl', quantity: 1 }],
		});
		expect(result).toEqual({
			handlingFee: 250,
			packagingFee: 200, // lp_single
			pickFee: 0,
			totalFee: 450,
		});
	});

	it('1 vinyl LP + t-shirt + stickers = $5.00 (handling $2.50 + LP mailer $2.00 + pick $0.50)', () => {
		const result = calculateDynamicFulfillmentFee({
			...defaults,
			products: [
				{ merchType: 'vinyl', quantity: 1 },
				{ merchType: 'tshirt', quantity: 1 },
				{ merchType: 'sticker', quantity: 1 },
			],
		});
		expect(result).toEqual({
			handlingFee: 250,
			packagingFee: 200, // LP mailer wins
			pickFee: 50, // 3 items - 1 free = 2 extra × $0.25
			totalFee: 500,
		});
	});

	it('1 CD + t-shirt = $3.25 (handling $2.50 + packaging $0.50 + pick $0.25)', () => {
		const result = calculateDynamicFulfillmentFee({
			...defaults,
			products: [
				{ merchType: 'cd', quantity: 1 },
				{ merchType: 'tshirt', quantity: 1 },
			],
		});
		expect(result).toEqual({
			handlingFee: 250,
			packagingFee: 50, // both cd_cassette and poly_bag are $0.50
			pickFee: 25,
			totalFee: 325,
		});
	});

	// Vinyl quantity logic

	it('2 vinyl = lp_double mailer ($2.50) + pick $0.25', () => {
		const result = calculateDynamicFulfillmentFee({
			...defaults,
			products: [{ merchType: 'vinyl', quantity: 2 }],
		});
		expect(result).toEqual({
			handlingFee: 250,
			packagingFee: 250, // lp_double because qty > 1
			pickFee: 25, // 2 - 1 = 1 extra
			totalFee: 525,
		});
	});

	it('vinyl + 2 CDs = LP mailer + 2 extra picks', () => {
		const result = calculateDynamicFulfillmentFee({
			...defaults,
			products: [
				{ merchType: 'vinyl', quantity: 1 },
				{ merchType: 'cd', quantity: 2 },
			],
		});
		expect(result).toEqual({
			handlingFee: 250,
			packagingFee: 200, // LP single mailer wins
			pickFee: 50, // 3 items - 1 free = 2 extra × $0.25
			totalFee: 500,
		});
	});

	// Workspace overrides

	it('respects workspace handling fee override', () => {
		const overrides: FulfillmentFeeOverrides = {
			handlingFee: 100, // $1.00 instead of $2.50
		};
		const result = calculateDynamicFulfillmentFee({
			...defaults,
			products: [{ merchType: 'cd', quantity: 1 }],
			workspaceOverrides: overrides,
		});
		expect(result.handlingFee).toBe(100);
		expect(result.totalFee).toBe(150); // $1.00 + $0.50 packaging
	});

	it('respects workspace pick fee override', () => {
		const overrides: FulfillmentFeeOverrides = {
			pickFeePerExtraItem: 10, // $0.10 instead of $0.25
		};
		const result = calculateDynamicFulfillmentFee({
			...defaults,
			products: [
				{ merchType: 'cd', quantity: 1 },
				{ merchType: 'sticker', quantity: 1 },
			],
			workspaceOverrides: overrides,
		});
		expect(result.pickFee).toBe(10);
	});

	it('respects workspace packaging fee override for LP', () => {
		const overrides: FulfillmentFeeOverrides = {
			packagingFees: {
				lp_single: 150, // $1.50 instead of $2.00
			},
		};
		const result = calculateDynamicFulfillmentFee({
			...defaults,
			products: [{ merchType: 'vinyl', quantity: 1 }],
			workspaceOverrides: overrides,
		});
		expect(result.packagingFee).toBe(150);
		expect(result.totalFee).toBe(400); // $2.50 handling + $1.50 packaging
	});

	it('handles zero-override for a fee (waived)', () => {
		const overrides: FulfillmentFeeOverrides = {
			handlingFee: 0,
			pickFeePerExtraItem: 0,
		};
		const result = calculateDynamicFulfillmentFee({
			...defaults,
			products: [
				{ merchType: 'vinyl', quantity: 1 },
				{ merchType: 'cd', quantity: 2 },
			],
			workspaceOverrides: overrides,
		});
		expect(result.handlingFee).toBe(0);
		expect(result.pickFee).toBe(0);
		expect(result.totalFee).toBe(200); // only LP packaging
	});

	it('returns all zeros when no physical products', () => {
		const result = calculateDynamicFulfillmentFee({
			...defaults,
			products: [],
		});
		expect(result).toEqual({
			handlingFee: 0,
			packagingFee: 0,
			pickFee: 0,
			totalFee: 0,
		});
	});

	it('poster uses poster_tube mailer at $1.00', () => {
		const result = calculateDynamicFulfillmentFee({
			...defaults,
			products: [{ merchType: 'poster', quantity: 1 }],
		});
		expect(result.packagingFee).toBe(100);
		expect(result.totalFee).toBe(350);
	});
});

describe('convertFulfillmentAmountIfNeeded', () => {
	it('returns unchanged amount when fulfilled by artist', () => {
		expect(convertFulfillmentAmountIfNeeded(250, 'artist', 'gbp')).toBe(250);
	});

	it('returns unchanged amount when workspace currency is usd', () => {
		expect(convertFulfillmentAmountIfNeeded(250, 'barely', 'usd')).toBe(250);
	});

	it('converts USD to GBP when barely fulfills for GBP workspace', () => {
		// 250 USD cents * 0.75 = 187.5, rounded to 188
		expect(convertFulfillmentAmountIfNeeded(250, 'barely', 'gbp')).toBe(188);
	});

	it('handles zero amounts', () => {
		expect(convertFulfillmentAmountIfNeeded(0, 'barely', 'gbp')).toBe(0);
	});

	it('rounds correctly for odd amounts', () => {
		// 33 * 0.75 = 24.75, rounded to 25
		expect(convertFulfillmentAmountIfNeeded(33, 'barely', 'gbp')).toBe(25);
		// 25 * 0.75 = 18.75, rounded to 19
		expect(convertFulfillmentAmountIfNeeded(25, 'barely', 'gbp')).toBe(19);
	});
});

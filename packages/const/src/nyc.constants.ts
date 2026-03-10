import { WORKSPACE_PLANS } from './workspace-plans.constants';

const raise = (err: unknown): never => {
	throw typeof err === 'string' ? new Error(err) : err;
};

// NYC Plus plans with promotional pricing
export const NYC_BEDROOM_PLUS =
	WORKSPACE_PLANS.get('bedroom.plus') ?? raise('Bedroom+ plan not found');
export const NYC_RISING_PLUS =
	WORKSPACE_PLANS.get('rising.plus') ?? raise('Rising+ plan not found');
export const NYC_BREAKOUT_PLUS =
	WORKSPACE_PLANS.get('breakout.plus') ?? raise('Breakout+ plan not found');

// Stan Service - TikTok Fan Account Management
export interface StanConfig {
	id: 'stan';
	name: string;
	description: string;
	marketingTagline: string;
	price: {
		standalone: number;
		risingBundle: number; // Discounted price for Rising+ clients
	};
	igReelsAddon: number; // Monthly add-on for Instagram Reels repurposing
	volumePricing: {
		twoToFour: number; // Per-account price for 2-4 accounts
		fivePlus: number; // Per-account price for 5+ accounts
	};
	labelPackage: {
		price: number; // Monthly price for label roster package
		maxAccounts: number; // Max accounts included
	};
	setupFees: {
		simple: number; // Simple setup (existing account, clear direction)
		customMin: number; // Custom setup minimum
		customMax: number; // Custom setup maximum
		risingWaived: boolean; // Waived for Rising+ clients
	};
	features: string[];
	includedWith: 'breakout.plus'; // Stan TikTok included with Breakout+
}

export const NYC_STAN: StanConfig = {
	id: 'stan',
	name: 'Stan',
	description: 'Daily TikTok fan account management for artists',
	marketingTagline: 'Fan Account Management for Artists Who Get It',
	price: {
		standalone: 500,
		risingBundle: 400,
	},
	igReelsAddon: 150,
	volumePricing: {
		twoToFour: 400,
		fivePlus: 350,
	},
	labelPackage: {
		price: 2500,
		maxAccounts: 8,
	},
	setupFees: {
		simple: 250,
		customMin: 500,
		customMax: 1000,
		risingWaived: true,
	},
	features: [
		'Daily TikTok posts (3x/day, manually posted)',
		'Dedicated device infrastructure',
		'Cohesive aesthetic defined with you',
		'DM and comment responses',
		'Shadowban protection protocols',
		'Monthly performance check-ins',
		'Instagram Reels add-on available',
	],
	includedWith: 'breakout.plus',
};

// Helper to get first month price or fallback to monthly
export const getNYCFirstMonthPrice = (
	planId: 'bedroom.plus' | 'rising.plus' | 'breakout.plus',
) => {
	const plan = WORKSPACE_PLANS.get(planId);
	return plan?.promotionalPrice?.firstMonth ?? plan?.price.monthly.amount ?? 0;
};

// Helper to get regular monthly price
export const getNYCMonthlyPrice = (
	planId: 'bedroom.plus' | 'rising.plus' | 'breakout.plus',
) => {
	return WORKSPACE_PLANS.get(planId)?.price.monthly.amount ?? 0;
};

// Referral credits = first month promotional price
export const getNYCReferralCredit = (
	planId: 'bedroom.plus' | 'rising.plus' | 'breakout.plus',
) => {
	return getNYCFirstMonthPrice(planId);
};

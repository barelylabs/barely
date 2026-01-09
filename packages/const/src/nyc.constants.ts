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

// Stan Service - Fan Account Management Add-on
export interface StanPricing {
	id: 'stan' | 'stan.plus';
	name: string;
	description: string;
	marketingTagline: string;
	price: {
		addon: number; // Price when added to Bedroom+ or Rising+
		standalone: number; // Price when purchased alone
	};
	promotionalPrice: {
		addon: number; // 30% off first month
		standalone: number;
		description: string;
	};
	features: string[];
	includedWith?: 'breakout.plus'; // Stan+ is included with Breakout+
}

export const NYC_STAN: StanPricing = {
	id: 'stan',
	name: 'Stan',
	description: 'Daily Instagram fan account management for artists',
	marketingTagline: 'Fan Account Management for Artists Who Get It',
	price: {
		addon: 250,
		standalone: 500,
	},
	promotionalPrice: {
		addon: 150, // ~40% off (matching the $250 → $150 in doc)
		standalone: 350, // 30% off
		description: 'First month special',
	},
	features: [
		'Daily Instagram posts',
		'Content mix: clips, AI visuals, memes, reposts',
		'You provide raw material, we keep it running',
		'Monthly performance check-in',
	],
};

export const NYC_STAN_PLUS: StanPricing = {
	id: 'stan.plus',
	name: 'Stan+',
	description: 'Full fan account management with active community building',
	marketingTagline: 'Everything in Stan, plus active community management',
	price: {
		addon: 500,
		standalone: 1000,
	},
	promotionalPrice: {
		addon: 350, // 30% off
		standalone: 700, // 30% off
		description: 'First month special',
	},
	features: [
		'Everything in Stan',
		'Active community management',
		'Cross-pollination with your main account',
		'Growth tactics: hashtags, engagement, collaborations',
		'Monthly strategy check-ins',
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

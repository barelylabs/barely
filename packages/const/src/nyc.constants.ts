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

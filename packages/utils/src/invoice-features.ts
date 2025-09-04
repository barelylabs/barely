import type { PlanType } from '@barely/const';
import { WORKSPACE_PLANS } from '@barely/const';

/**
 * Invoice feature flags based on plan
 */
export interface InvoiceFeatures {
	maxInvoicesPerMonth: number;
	maxClients: number;
	recurringBilling: boolean;
	customBranding: boolean;
	premiumTemplates: boolean;
	automatedReminders: boolean;
	paymentTrackingDays: number;
	transactionFeePercentage: number;
}

/**
 * Get invoice features available for a given plan
 * Pulls all data directly from the plan configuration in workspace-plans.constants.ts
 */
export function getInvoiceFeatures(plan: PlanType): InvoiceFeatures {
	// Use free plan as fallback if plan not found
	const planConfig = WORKSPACE_PLANS.get(plan) ?? WORKSPACE_PLANS.get('free');

	if (!planConfig) {
		throw new Error(`Plan ${plan} not found`);
	}

	// All features come directly from the plan config - single source of truth
	return {
		maxInvoicesPerMonth: planConfig.usageLimits.invoicesPerMonth,
		maxClients: planConfig.usageLimits.invoiceClients,
		recurringBilling: planConfig.invoiceRecurringBilling,
		customBranding: planConfig.customBranding,
		premiumTemplates: planConfig.invoicePremiumTemplates,
		automatedReminders: planConfig.invoiceAutomatedReminders,
		paymentTrackingDays: planConfig.invoicePaymentTrackingDays,
		transactionFeePercentage: planConfig.invoiceTransactionFeePercentage,
	};
}

/**
 * Check if a specific invoice feature is available for a plan
 */
export function hasInvoiceFeature(
	plan: PlanType,
	feature: keyof Omit<
		InvoiceFeatures,
		| 'maxInvoicesPerMonth'
		| 'maxClients'
		| 'paymentTrackingDays'
		| 'transactionFeePercentage'
	>,
): boolean {
	const features = getInvoiceFeatures(plan);
	return features[feature];
}

/**
 * Get descriptive text for unavailable features
 */
export function getFeatureUnavailableMessage(
	feature: string,
	currentPlan: PlanType,
): string {
	const isFreePlan = currentPlan === 'free';

	switch (feature) {
		case 'recurringBilling':
			return isFreePlan ?
					'Recurring billing is available on Invoice Pro. Upgrade to automate your recurring invoices.'
				:	'Recurring billing requires a higher plan. Please upgrade to access this feature.';

		case 'customBranding':
			return isFreePlan ?
					'Remove "Sent with Barely Invoice" and add your branding with Invoice Pro.'
				:	'Custom branding requires a higher plan. Please upgrade to access this feature.';

		case 'premiumTemplates':
			return isFreePlan ?
					'Access 5+ premium invoice templates with Invoice Pro.'
				:	'Premium templates require the Breakout plan or higher.';

		case 'automatedReminders':
			return isFreePlan ?
					'Automate payment reminders with Invoice Pro. Never chase payments manually again.'
				:	'Automated reminders require a higher plan. Please upgrade to access this feature.';

		default:
			return 'This feature requires an upgraded plan.';
	}
}

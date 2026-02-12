import { WORKSPACE_PLANS } from '@barely/const';
import { getFirstAndLastDayOfBillingCycle } from '@barely/utils';

import { useWorkspaceWithAll } from './use-workspace';

/**
 * Individual usage metric with current value and limit
 */
export interface UsageMetric {
	current: number;
	limit: number;
	isUnlimited: boolean;
	percentage: number;
}

/**
 * All usage metrics returned by useUsage hook
 */
export interface UsageMetrics {
	fans: UsageMetric;
	members: UsageMetric;
	pixels: UsageMetric;
	links: UsageMetric;
	emails: UsageMetric;
	events: UsageMetric;
	tasks: UsageMetric;
	invoices: UsageMetric;
	storage: UsageMetric;
	totalStorage: UsageMetric;
}

/**
 * Creates a UsageMetric object with computed percentage
 */
function createUsageMetric(current: number, limit: number): UsageMetric {
	const isUnlimited = limit === Number.MAX_SAFE_INTEGER;
	const percentage = isUnlimited || limit === 0 ? 0 : (current / limit) * 100;
	return { current, limit, isUnlimited, percentage };
}

export function useUsage() {
	const workspace = useWorkspaceWithAll();

	const {
		plan: planId,
		billingCycleStart,
		// Usage counters
		fanUsage,
		memberUsage,
		pixelUsage,
		linkUsage,
		emailUsage,
		eventUsage,
		taskUsage,
		invoiceUsage,
		fileUsage_billingCycle,
		fileUsage_total,
		// Usage limit overrides
		fanUsageLimitOverride,
		memberUsageLimitOverride,
		pixelUsageLimitOverride,
		linkUsageLimitOverride,
		emailUsageLimitOverride,
		eventUsageLimitOverride,
		taskUsageLimitOverride,
		invoiceUsageLimitOverride,
	} = workspace;

	const plan = WORKSPACE_PLANS.get(planId);
	if (!plan) {
		console.error('Invalid plan', planId);
		throw new Error('Invalid plan');
	}

	// Legacy usageLimits object for backwards compatibility
	const usageLimits = {
		fans: plan.usageLimits.fans,
		members: plan.usageLimits.members,
		retargetingPixels: plan.usageLimits.retargetingPixels,

		newLinksPerMonth: plan.usageLimits.newLinksPerMonth,

		emailsPerDay: plan.usageLimits.emailsPerDay,
		emailsPerMonth: plan.usageLimits.emailsPerMonth,

		trackedEventsPerMonth: plan.usageLimits.trackedEventsPerMonth,

		tasksPerDay: plan.usageLimits.tasksPerDay,
		tasksPerMonth: plan.usageLimits.tasksPerMonth,

		invoicesPerMonth: plan.usageLimits.invoicesPerMonth,
		invoiceClients: plan.usageLimits.invoiceClients,

		storagePerMonth: plan.usageLimits.storagePerMonth,
		totalStorage: plan.usageLimits.totalStorage,

		analyticsRetentionDays: plan.analyticsRetentionDays,
	};

	// Compute effective limits (considering overrides)
	const getEffectiveLimit = (
		planLimit: number,
		override: number | null | undefined,
	): number => {
		return override ?? planLimit;
	};

	// Create metrics objects with current usage and effective limits
	const metrics: UsageMetrics = {
		fans: createUsageMetric(
			fanUsage,
			getEffectiveLimit(plan.usageLimits.fans, fanUsageLimitOverride),
		),
		members: createUsageMetric(
			memberUsage,
			getEffectiveLimit(plan.usageLimits.members, memberUsageLimitOverride),
		),
		pixels: createUsageMetric(
			pixelUsage,
			getEffectiveLimit(plan.usageLimits.retargetingPixels, pixelUsageLimitOverride),
		),
		links: createUsageMetric(
			linkUsage,
			getEffectiveLimit(plan.usageLimits.newLinksPerMonth, linkUsageLimitOverride),
		),
		emails: createUsageMetric(
			emailUsage,
			getEffectiveLimit(plan.usageLimits.emailsPerMonth, emailUsageLimitOverride),
		),
		events: createUsageMetric(
			eventUsage,
			getEffectiveLimit(plan.usageLimits.trackedEventsPerMonth, eventUsageLimitOverride),
		),
		tasks: createUsageMetric(
			taskUsage,
			getEffectiveLimit(plan.usageLimits.tasksPerMonth, taskUsageLimitOverride),
		),
		invoices: createUsageMetric(
			invoiceUsage,
			getEffectiveLimit(plan.usageLimits.invoicesPerMonth, invoiceUsageLimitOverride),
		),
		storage: createUsageMetric(fileUsage_billingCycle, plan.usageLimits.storagePerMonth),
		totalStorage: createUsageMetric(fileUsage_total, plan.usageLimits.totalStorage),
	};

	const { firstDay, lastDay } = getFirstAndLastDayOfBillingCycle(billingCycleStart ?? 0);

	return {
		// Billing cycle dates
		firstDay,
		lastDay,

		// All metrics with current/limit/percentage
		metrics,

		// Individual usage values (backwards compatible)
		linkUsage,
		invoiceUsage,
		fanUsage,
		memberUsage,
		pixelUsage,
		emailUsage,
		eventUsage,
		taskUsage,
		storageUsage: fileUsage_billingCycle,

		// Legacy limits object (backwards compatible)
		usageLimits,

		// Plan info
		planId,
		planName: plan.name,
	};
}

import { WORKSPACE_PLANS } from '@barely/const';
import { getFirstAndLastDayOfBillingCycle } from '@barely/utils';

import { useWorkspaceWithAll } from './use-workspace';

export function useUsage() {
	const {
		plan: planId,
		billingCycleStart,
		linkUsage,
		invoiceUsage,
	} = useWorkspaceWithAll();

	const plan = WORKSPACE_PLANS.get(planId);
	if (!plan) {
		console.error('Invalid plan', planId);
		throw new Error('Invalid plan');
	}

	const usageLimits = {
		fans: plan.usageLimits.fans,
		members: plan.usageLimits.members,
		retargetingPixels: plan.usageLimits.retargetingPixels,

		newLinksPerMonth: plan.usageLimits.newLinksPerMonth,
		linkClicksPerMonth: plan.usageLimits.linkClicksPerMonth,

		emailsPerDay: plan.usageLimits.emailsPerDay,
		emailsPerMonth: plan.usageLimits.emailsPerMonth,

		trackedEventsPerMonth: plan.usageLimits.trackedEventsPerMonth,

		tasksPerDay: plan.usageLimits.tasksPerDay,
		tasksPerMonth: plan.usageLimits.tasksPerMonth,

		invoicesPerMonth: plan.usageLimits.invoicesPerMonth,
		invoiceClients: plan.usageLimits.invoiceClients,

		analyticsRetentionDays: plan.analyticsRetentionDays,
	};

	const { firstDay, lastDay } = getFirstAndLastDayOfBillingCycle(billingCycleStart ?? 0);

	return {
		firstDay,
		lastDay,
		linkUsage,
		invoiceUsage,
		usageLimits,
	};
}

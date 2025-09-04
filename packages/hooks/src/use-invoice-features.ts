import { getInvoiceFeatures, hasInvoiceFeature } from '@barely/utils';

import { useWorkspace } from './use-workspace';

/**
 * Hook to access invoice features based on current workspace plan
 */
export function useInvoiceFeatures() {
	const { workspace } = useWorkspace();
	const plan = workspace.plan;

	const features = getInvoiceFeatures(plan);

	return {
		features,
		plan,
		hasFeature: (feature: Parameters<typeof hasInvoiceFeature>[1]) =>
			hasInvoiceFeature(plan, feature),
		isFreePlan: plan === 'free',
		isProPlan: plan === 'invoice.pro',
	};
}

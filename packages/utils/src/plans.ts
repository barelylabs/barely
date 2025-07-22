import type { PlanType } from '@barely/const';
import { WORKSPACE_PLANS } from '@barely/const';

export function getPlanNameFromId(planId: PlanType) {
	return WORKSPACE_PLANS.get(planId)?.name;
}

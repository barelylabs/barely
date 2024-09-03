export const FLOW_TRIGGERS = ['callFlow', 'newFan', 'newCartOrder'] as const;
export type FlowTriggerType = (typeof FLOW_TRIGGERS)[number];

export const FLOW_ACTIONS = [
	'wait',
	'addToMailchimpAudience',
	'sendEmail',
	'boolean',
	'empty',
] as const;
export type FlowActionType = (typeof FLOW_ACTIONS)[number];

export const FLOW_BOOLEAN_CONDITIONS = [
	'hasOrderedProduct',
	'hasOrderedCart',
	'hasOrderedAmount',
] as const;
export type FlowBooleanCondition = (typeof FLOW_BOOLEAN_CONDITIONS)[number];

export const FLOW_RUN_STATUSES = ['pending', 'running', 'completed', 'failed'] as const;
export const FLOW_RUN_ACTION_STATUSES = [
	'pending',
	'running',
	'completed',
	'skipped',
	'failed',
] as const;
export type FlowRunStatus = (typeof FLOW_RUN_STATUSES)[number];
export type FlowRunActionStatus = (typeof FLOW_RUN_ACTION_STATUSES)[number];

// defaults

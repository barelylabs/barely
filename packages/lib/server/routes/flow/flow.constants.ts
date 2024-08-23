export const FLOW_TRIGGERS = ['CALL_FLOW', 'NEW_FAN', 'NEW_CART_ORDER'] as const;
export type FlowTrigger = (typeof FLOW_TRIGGERS)[number];

export const FLOW_ACTIONS = [
	'WAIT',
	'ADD_TO_MAILCHIMP_AUDIENCE',
	'SEND_EMAIL',
	'EMPTY',
] as const;
export type FlowAction = (typeof FLOW_ACTIONS)[number];

export const FLOW_BOOLEAN_CONDITIONS = ['HAS_ORDERED'] as const;
export type FlowBooleanCondition = (typeof FLOW_BOOLEAN_CONDITIONS)[number];

export const FLOW_RUN_STATUSES = ['pending', 'running', 'completed', 'failed'] as const;
export const FLOW_RUN_ACTION_STATUSES = [
	'pending',
	'running',
	'completed',
	'failed',
] as const;
export type FlowRunStatus = (typeof FLOW_RUN_STATUSES)[number];
export type FlowRunActionStatus = (typeof FLOW_RUN_ACTION_STATUSES)[number];

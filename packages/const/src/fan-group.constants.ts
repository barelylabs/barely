export const FAN_GROUP_CONDITIONS = [
	'hasOrderedProduct',
	'hasOrderedCart',
	'hasOrderedAmount',
] as const;
export type FanGroupCondition = (typeof FAN_GROUP_CONDITIONS)[number];

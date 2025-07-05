export const EMAIL_DELIVERY_STATUSES = [
	'scheduled',
	'sent',
	'failed',
	'delivered',
	'opened',
	'clicked',
	'complained',
	'bounced',
	'unsubscribed',
] as const;

export type EmailDeliveryStatus = (typeof EMAIL_DELIVERY_STATUSES)[number];

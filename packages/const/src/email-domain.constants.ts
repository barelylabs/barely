export const EMAIL_DOMAIN_REGIONS = ['us-east-1', 'eu-west-1', 'sa-east-1'] as const;

export const EMAIL_DOMAIN_STATUSES = [
	'not_started',
	'pending',
	'verified',
	'failed',
	'temporary_failure',
] as const;

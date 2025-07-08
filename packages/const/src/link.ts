import type { InsertDomain } from './domain.constants';

export const BARELY_SHORTLINK_DOMAIN: InsertDomain = {
	domain: 'brl.to',
	workspaceId: '',
	type: 'link',
	verified: true,
	target: 'https://barely.link',
	description: 'Barely Link',
	clicks: 0,
} as const;

import { EMAIL_DOMAIN_REGIONS, EMAIL_DOMAIN_STATUSES } from '@barely/const';
import { relations } from 'drizzle-orm';
import { boolean, pgTable, text, varchar } from 'drizzle-orm/pg-core';

import { customJsonb, dbId, primaryId, timestamps } from '../utils';
import { Workspaces } from './workspace.sql';

type DomainStatus =
	| 'pending'
	| 'verified'
	| 'failed'
	| 'temporary_failure'
	| 'not_started';

interface DomainSpfRecord {
	record: 'SPF';
	name: string;
	value: string;
	type: 'MX' | 'TXT';
	ttl: string;
	status: DomainStatus;
	routing_policy?: string;
	priority?: number;
	proxy_status?: 'enable' | 'disable';
}
interface DomainDkimRecord {
	record: 'DKIM';
	name: string;
	value: string;
	type: 'CNAME' | 'TXT';
	ttl: string;
	status: DomainStatus;
	routing_policy?: string;
	priority?: number;
	proxy_status?: 'enable' | 'disable';
}

export type Resend_DomainRecord = DomainSpfRecord | DomainDkimRecord;

/* Email Domains */
export const EmailDomains = pgTable('EmailDomains', {
	...primaryId,
	...timestamps,

	workspaceId: dbId('workspaceId')
		.notNull()
		.references(() => Workspaces.id),

	name: varchar('domain', { length: 256 }).notNull(),
	region: text('region', { enum: EMAIL_DOMAIN_REGIONS }).notNull().default('us-east-1'),

	resendId: text('resendId').notNull(),
	status: text('status', { enum: EMAIL_DOMAIN_STATUSES })
		.notNull()
		.default('not_started'),

	records: customJsonb<Resend_DomainRecord[]>('records').notNull().default([]),

	clickTracking: boolean('clickTracking').notNull().default(false),
	openTracking: boolean('openTracking').notNull().default(false),
});

export const EmailDomainRelations = relations(EmailDomains, ({ one }) => ({
	workspace: one(Workspaces, {
		fields: [EmailDomains.workspaceId],
		references: [Workspaces.id],
	}),
}));

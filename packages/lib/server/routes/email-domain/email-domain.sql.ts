import type { Resend_DomainRecord } from '@barely/email';
import { relations } from 'drizzle-orm';
import { boolean, pgTable, text, varchar } from 'drizzle-orm/pg-core';

import { customJsonb, dbId, primaryId, timestamps } from '../../../utils/sql';
import { Workspaces } from '../workspace/workspace.sql';
import { EMAIL_DOMAIN_REGIONS, EMAIL_DOMAIN_STATUSES } from './email-domain.constants';

export interface DomainRecordsJson {
	records: Resend_DomainRecord[];
}

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

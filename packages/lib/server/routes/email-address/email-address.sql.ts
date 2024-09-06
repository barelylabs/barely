import { relations } from 'drizzle-orm';
import { boolean, pgTable, unique, varchar } from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../../../utils/sql';
import { EmailDomains } from '../email-domain/email-domain.sql';
import { EmailTemplates } from '../email-template/email-template.sql';
import { Workspaces } from '../workspace/workspace.sql';

/* Email Addresses */
export const EmailAddresses = pgTable(
	'EmailAddresses',
	{
		...primaryId,
		...timestamps,

		workspaceId: dbId('workspaceId')
			.notNull()
			.references(() => Workspaces.id),

		username: varchar('username', { length: 256 }).notNull(),
		domainId: dbId('domainId')
			.notNull()
			.references(() => EmailDomains.id),
		replyTo: varchar('replyTo', { length: 256 }),

		defaultFriendlyName: varchar('defaultFriendlyName', { length: 256 }),
		default: boolean('default').notNull().default(false),
	},
	table => ({
		unique: unique().on(table.username, table.domainId),
	}),
);

export const EmailAddressRelations = relations(EmailAddresses, ({ one, many }) => ({
	workspace: one(Workspaces, {
		fields: [EmailAddresses.workspaceId],
		references: [Workspaces.id],
	}),
	emails: many(EmailTemplates),
	domain: one(EmailDomains, {
		fields: [EmailAddresses.domainId],
		references: [EmailDomains.id],
	}),
}));

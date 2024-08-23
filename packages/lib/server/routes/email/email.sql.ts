import { relations } from 'drizzle-orm';
import { pgTable, text } from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../../../utils/sql';
import { EmailAddresses } from '../email-domain/email-domain.sql';
import { Workspaces } from '../workspace/workspace.sql';

export const Emails = pgTable('Emails', {
	...primaryId,
	...timestamps,

	workspaceId: dbId('workspaceId')
		.notNull()
		.references(() => Workspaces.id),

	fromId: dbId('fromId').references(() => EmailAddresses.id, {
		onUpdate: 'cascade',
		onDelete: 'cascade',
	}),

	subject: text('subject').notNull(),
	body: text('body').notNull(),
});

export const EmailRelations = relations(Emails, ({ one }) => ({
	from: one(EmailAddresses, {
		fields: [Emails.fromId],
		references: [EmailAddresses.id],
	}),
	workspace: one(Workspaces, {
		fields: [Emails.workspaceId],
		references: [Workspaces.id],
	}),
}));

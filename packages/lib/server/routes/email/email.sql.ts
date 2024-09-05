import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../../../utils/sql';
import { EmailAddresses } from '../email-address/email-address.sql';
import { Fans } from '../fan/fan.sql';
import { Workspaces } from '../workspace/workspace.sql';

export const EmailTemplates = pgTable('EmailTemplates', {
	...primaryId,
	...timestamps,

	workspaceId: dbId('workspaceId')
		.notNull()
		.references(() => Workspaces.id),

	fromId: dbId('fromId')
		.notNull()
		.references(() => EmailAddresses.id, {
			onUpdate: 'cascade',
			onDelete: 'cascade',
		}),

	name: text('name').notNull().default('Email Template'),
	description: text('description'),

	replyTo: text('replyTo'),
	subject: text('subject').notNull(),
	body: text('body').notNull(),
});

export const EmailRelations = relations(EmailTemplates, ({ one }) => ({
	from: one(EmailAddresses, {
		fields: [EmailTemplates.fromId],
		references: [EmailAddresses.id],
	}),
	workspace: one(Workspaces, {
		fields: [EmailTemplates.workspaceId],
		references: [Workspaces.id],
	}),
}));

export const EmailDeliveries = pgTable('EmailDeliveries', {
	...primaryId,
	...timestamps,
	workspaceId: dbId('workspaceId')
		.notNull()
		.references(() => Workspaces.id),
	emailTemplateId: dbId('emailTemplateId')
		.notNull()
		.references(() => EmailTemplates.id),

	// delivery
	resendId: text('resendId'),
	fanId: dbId('fanId')
		.notNull()
		.references(() => Fans.id),
	status: text('status', { enum: ['scheduled', 'sent', 'failed'] }).notNull(),
	scheduledAt: timestamp('scheduledAt'),
	sentAt: timestamp('sentAt'),
});

export const EmailDeliveryRelations = relations(EmailDeliveries, ({ one }) => ({
	emailTemplate: one(EmailTemplates, {
		fields: [EmailDeliveries.emailTemplateId],
		references: [EmailTemplates.id],
	}),
	workspace: one(Workspaces, {
		fields: [EmailDeliveries.workspaceId],
		references: [Workspaces.id],
	}),
	fan: one(Fans, {
		fields: [EmailDeliveries.fanId],
		references: [Fans.id],
	}),
}));

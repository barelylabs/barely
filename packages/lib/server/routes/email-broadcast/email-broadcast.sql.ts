import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../../../utils/sql';
import { EmailTemplates } from '../email-template/email-template.sql';
import { FanGroups } from '../fan-group/fan-group.sql';
import { Workspaces } from '../workspace/workspace.sql';

export const EmailBroadcasts = pgTable('EmailBroadcasts', {
	...primaryId,
	...timestamps,

	workspaceId: dbId('workspaceId')
		.notNull()
		.references(() => Workspaces.id),

	emailTemplateId: dbId('emailTemplateId')
		.notNull()
		.references(() => EmailTemplates.id),

	fanGroupId: dbId('fanGroupId').references(() => FanGroups.id),

	status: text('status', {
		enum: ['draft', 'scheduled', 'sending', 'sent', 'failed'],
	})
		.notNull()
		.default('draft'),

	scheduledAt: timestamp('scheduledAt'), // if scheduled, when to send
	sentAt: timestamp('sentAt'), // if sent, when it was sent

	error: text('error'),
	triggerRunId: text('triggerRunId'),
});

export const EmailBroadcastRelations = relations(EmailBroadcasts, ({ one }) => ({
	workspace: one(Workspaces, {
		fields: [EmailBroadcasts.workspaceId],
		references: [Workspaces.id],
	}),
	emailTemplate: one(EmailTemplates, {
		fields: [EmailBroadcasts.emailTemplateId],
		references: [EmailTemplates.id],
	}),
	fanGroup: one(FanGroups, {
		fields: [EmailBroadcasts.fanGroupId],
		references: [FanGroups.id],
	}),
}));
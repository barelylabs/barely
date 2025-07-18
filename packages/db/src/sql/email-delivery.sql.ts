import { EMAIL_DELIVERY_STATUSES } from '@barely/const';
import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../utils';
import { EmailBroadcasts } from './email-broadcast.sql';
import { EmailTemplates } from './email-template.sql';
import { Fans } from './fan.sql';
import { FlowRunActions } from './flow.sql';
import { Workspaces } from './workspace.sql';

export const EmailDeliveries = pgTable('EmailDeliveries', {
	...primaryId,
	...timestamps,
	workspaceId: dbId('workspaceId')
		.notNull()
		.references(() => Workspaces.id),
	emailTemplateId: dbId('emailTemplateId')
		.notNull()
		.references(() => EmailTemplates.id),

	// where was this sent from?
	// flowActionId: dbId('flowActionId').references(() => Flow_Actions.id),
	flowRunActionId: dbId('flowRunActionId').references(() => FlowRunActions.id),
	emailBroadcastId: dbId('emailBroadcastId').references(() => EmailBroadcasts.id),

	// delivery
	resendId: text('resendId'),
	fanId: dbId('fanId')
		.notNull()
		.references(() => Fans.id),
	status: text('status', {
		enum: EMAIL_DELIVERY_STATUSES,
	}).notNull(),
	scheduledAt: timestamp('scheduledAt'),
	sentAt: timestamp('sentAt'),

	deliveredAt: timestamp('deliveredAt'),
	openedAt: timestamp('openedAt'),
	bouncedAt: timestamp('bouncedAt'),
	clickedAt: timestamp('clickedAt'),
	complainedAt: timestamp('complainedAt'),
	unsubscribedAt: timestamp('unsubscribedAt'),
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

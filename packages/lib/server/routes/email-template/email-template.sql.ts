import { relations } from 'drizzle-orm';
import {
	foreignKey,
	integer,
	pgTable,
	primaryKey,
	text,
	timestamp,
	unique,
} from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../../../utils/sql';
import { EmailAddresses } from '../email-address/email-address.sql';
import { Fans } from '../fan/fan.sql';
import { Tags } from '../tag/tag.sql';
import { Workspaces } from '../workspace/workspace.sql';

/* Email Templates */
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

export const EmailTemplateRelations = relations(EmailTemplates, ({ one, many }) => ({
	from: one(EmailAddresses, {
		fields: [EmailTemplates.fromId],
		references: [EmailAddresses.id],
	}),
	workspace: one(Workspaces, {
		fields: [EmailTemplates.workspaceId],
		references: [Workspaces.id],
	}),
	_emailTemplates_To_EmailTemplateGroups: many(_EmailTemplates_To_EmailTemplateGroups),
}));

export const EmailTemplateTags = pgTable(
	'EmailTemplateTags',
	{
		// ...primaryId,
		...timestamps,

		emailTemplateId: dbId('emailTemplateId')
			.notNull()
			.references(() => EmailTemplates.id),

		workspaceId: dbId('workspaceId').notNull(),
		// .references(() => Tags.workspaceId),

		tagName: text('tagName').notNull(),
		// .references(() => Tags.name),
	},
	emailTemplateTag => ({
		pk: primaryKey({
			columns: [
				emailTemplateTag.workspaceId,
				emailTemplateTag.emailTemplateId,
				emailTemplateTag.tagName,
			],
		}),
		tagFk: foreignKey({
			columns: [emailTemplateTag.workspaceId, emailTemplateTag.tagName],
			foreignColumns: [Tags.workspaceId, Tags.name],
		}),
	}),
);

export const EmailTemplateTagsRelations = relations(EmailTemplateTags, ({ one }) => ({
	emailTemplate: one(EmailTemplates, {
		fields: [EmailTemplateTags.emailTemplateId],
		references: [EmailTemplates.id],
	}),
	tag: one(Tags, {
		fields: [EmailTemplateTags.workspaceId, EmailTemplateTags.tagName],
		references: [Tags.workspaceId, Tags.name],
	}),
}));

/* Email Template Groups */
export const EmailTemplateGroups = pgTable('EmailTemplateGroups', {
	...primaryId,
	...timestamps,

	workspaceId: dbId('workspaceId')
		.notNull()
		.references(() => Workspaces.id),

	name: text('name').notNull(),
	description: text('description'),
});

export const EmailTemplateGroupRelations = relations(
	EmailTemplateGroups,
	({ one, many }) => ({
		workspace: one(Workspaces, {
			fields: [EmailTemplateGroups.workspaceId],
			references: [Workspaces.id],
		}),
		_emailTemplates_To_EmailTemplateGroups: many(_EmailTemplates_To_EmailTemplateGroups),
	}),
);

export const _EmailTemplates_To_EmailTemplateGroups = pgTable(
	'_EmailTemplates_To_EmailTemplateGroups',
	{
		...timestamps,

		emailTemplateGroupId: dbId('emailTemplateGroupId')
			.notNull()
			.references(() => EmailTemplateGroups.id),
		emailTemplateId: dbId('emailTemplateId')
			.notNull()
			.references(() => EmailTemplates.id),
		index: integer('index').notNull(),
		// lexorank: text('lexorank').notNull(),
	},
	table => ({
		pk: primaryKey({
			columns: [table.emailTemplateGroupId, table.emailTemplateId],
		}),
	}),
);

export const _EmailTemplates_To_EmailTemplateGroupsRelations = relations(
	_EmailTemplates_To_EmailTemplateGroups,
	({ one }) => ({
		emailTemplateGroup: one(EmailTemplateGroups, {
			fields: [_EmailTemplates_To_EmailTemplateGroups.emailTemplateGroupId],
			references: [EmailTemplateGroups.id],
		}),
		emailTemplate: one(EmailTemplates, {
			fields: [_EmailTemplates_To_EmailTemplateGroups.emailTemplateId],
			references: [EmailTemplates.id],
		}),
	}),
);

/* Email Template Group Tags */
export const EmailTemplateGroupTags = pgTable(
	'EmailTemplateGroupTags',
	{
		...primaryId,
		...timestamps,

		emailTemplateGroupId: dbId('emailTemplateGroupId')
			.notNull()
			.references(() => EmailTemplateGroups.id),

		workspaceId: dbId('workspaceId').notNull(),
		tagName: text('tagName').notNull(),
	},
	t => ({
		tagFk: foreignKey({
			columns: [t.workspaceId, t.tagName],
			foreignColumns: [Tags.workspaceId, Tags.name],
		}),
		unique: unique('email_template_group_tags_unique').on(
			t.workspaceId,
			t.emailTemplateGroupId,
			t.tagName,
		),
	}),
);

export const EmailTemplateGroupTagsRelations = relations(
	EmailTemplateGroupTags,
	({ one }) => ({
		emailTemplateGroup: one(EmailTemplateGroups, {
			fields: [EmailTemplateGroupTags.emailTemplateGroupId],
			references: [EmailTemplateGroups.id],
		}),
	}),
);

/* Email Deliveries */
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

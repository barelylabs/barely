import { relations } from 'drizzle-orm';
import {
	boolean,
	foreignKey,
	integer,
	pgTable,
	primaryKey,
	text,
	unique,
} from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../utils';
import { EmailAddresses } from './email-address.sql';
import { EmailDeliveries } from './email-delivery.sql';
import { Tags } from './tag.sql';
import { Workspaces } from './workspace.sql';

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

	type: text('type', { enum: ['marketing', 'transactional'] })
		.notNull()
		.default('marketing'),
	flowOnly: boolean('flowOnly').notNull().default(false),
	broadcastOnly: boolean('broadcastOnly').notNull().default(false),

	replyTo: text('replyTo'),
	subject: text('subject').notNull(),
	previewText: text('previewText'),
	body: text('body').notNull(),

	// stats
	deliveries: integer('deliveries').default(0),
	opens: integer('opens').default(0),
	clicks: integer('clicks').default(0),
	value: integer('value').default(0),
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
	deliveries: many(EmailDeliveries),
	_emailTemplates_To_TemplateGroups: many(_EmailTemplates_To_EmailTemplateGroups, {
		relationName: 'template',
	}),
}));

/* Email Template Tags */
export const EmailTemplateTags = pgTable(
	'EmailTemplateTags',
	{
		...timestamps,

		emailTemplateId: dbId('emailTemplateId')
			.notNull()
			.references(() => EmailTemplates.id),

		workspaceId: dbId('workspaceId').notNull(),
		tagName: text('tagName').notNull(),
	},
	t => ({
		pk: primaryKey({
			columns: [t.emailTemplateId, t.workspaceId, t.tagName],
			name: 'email_template_tags_pk',
		}),
		tagFk: foreignKey({
			columns: [t.workspaceId, t.tagName],
			foreignColumns: [Tags.workspaceId, Tags.name],
			name: 'email_template_tags_tag_fk',
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
		_templates_To_Groups: many(_EmailTemplates_To_EmailTemplateGroups, {
			relationName: 'templateGroup',
		}),
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
	},
	table => ({
		pk: primaryKey({
			columns: [table.emailTemplateGroupId, table.emailTemplateId],
			name: '_email_templates_to_template_groups_pk',
		}),
	}),
);

export const _EmailTemplates_To_EmailTemplateGroupsRelations = relations(
	_EmailTemplates_To_EmailTemplateGroups,
	({ one }) => ({
		emailTemplateGroup: one(EmailTemplateGroups, {
			fields: [_EmailTemplates_To_EmailTemplateGroups.emailTemplateGroupId],
			references: [EmailTemplateGroups.id],
			relationName: 'templateGroup',
		}),
		emailTemplate: one(EmailTemplates, {
			fields: [_EmailTemplates_To_EmailTemplateGroups.emailTemplateId],
			references: [EmailTemplates.id],
			relationName: 'template',
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

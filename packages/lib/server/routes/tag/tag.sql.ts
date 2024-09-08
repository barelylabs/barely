import { relations } from 'drizzle-orm';
import { pgTable, primaryKey, text } from 'drizzle-orm/pg-core';

import { dbId, timestamps } from '../../../utils/sql';
import {
	EmailTemplateGroups,
	EmailTemplates,
} from '../email-template/email-template.sql';
import { Workspaces } from '../workspace/workspace.sql';

export const Tags = pgTable(
	'Tags',
	{
		...timestamps,

		workspaceId: dbId('workspaceId')
			.notNull()
			.references(() => Workspaces.id),

		name: text('name').notNull(),
		description: text('description'),
	},
	tag => ({
		pk: primaryKey({ columns: [tag.workspaceId, tag.name], name: 'tag_pk' }),
	}),
);

export const TagsRelations = relations(Tags, ({ one, many }) => ({
	workspace: one(Workspaces, {
		fields: [Tags.workspaceId],
		references: [Workspaces.id],
	}),
	emailTemplates: many(EmailTemplates),
	emailTemplateGroups: many(EmailTemplateGroups),
}));

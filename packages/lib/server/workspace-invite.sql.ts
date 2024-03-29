import { relations } from 'drizzle-orm';
import { index, pgTable, primaryKey, timestamp, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from '../utils/sql';
import { Workspaces } from './workspace.sql';

export const WorkspaceInvites = pgTable(
	'WorkspaceInvites',
	{
		email: varchar('email', { length: 255 }).notNull(),
		expiresAt: timestamp('expiresAt').notNull(),
		workspaceId: varchar('workspaceId', { length: 255 })
			.notNull()
			.references(() => Workspaces.id, {
				onDelete: 'cascade',
			}),
		role: varchar('role', { length: 255, enum: ['owner', 'admin', 'member'] })
			.default('member')
			.notNull(),

		...timestamps,
	},
	table => ({
		pk: primaryKey({ columns: [table.email, table.workspaceId] }),
		workspaceIndex: index('WorkspaceInvites_workspaceId_index').on(table.workspaceId),
	}),
);

export const WorkspaceInviteRelations = relations(WorkspaceInvites, ({ one }) => ({
	workspace: one(Workspaces, {
		fields: [WorkspaceInvites.workspaceId],
		references: [Workspaces.id],
	}),
}));

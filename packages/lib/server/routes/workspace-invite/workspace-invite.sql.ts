import { relations } from 'drizzle-orm';
import {
	index,
	pgTable,
	primaryKey,
	timestamp,
	// unique,
	varchar,
} from 'drizzle-orm/pg-core';

import { timestamps } from '../../../utils/sql';
import { Users } from '../user/user.sql';
import { Workspaces } from '../workspace/workspace.sql';

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
		userId: varchar('userId', { length: 255 }).references(() => Users.id, {
			onDelete: 'cascade',
		}),
		role: varchar('role', { length: 255, enum: ['owner', 'admin', 'member'] })
			.default('member')
			.notNull(),
		acceptedAt: timestamp('acceptedAt'),
		declinedAt: timestamp('declinedAt'),
		...timestamps,
	},
	table => ({
		pk: primaryKey({ columns: [table.email, table.workspaceId] }),
		// unique: unique('WorkspaceInvites_unique').on(table.userId, table.workspaceId),
		workspaceIndex: index('WorkspaceInvites_workspaceId_index').on(table.workspaceId),
	}),
);

export const WorkspaceInviteRelations = relations(WorkspaceInvites, ({ one }) => ({
	workspace: one(Workspaces, {
		fields: [WorkspaceInvites.workspaceId],
		references: [Workspaces.id],
	}),
	user: one(Users, {
		fields: [WorkspaceInvites.userId],
		references: [Users.id],
	}),
}));

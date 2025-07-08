import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { index, pgTable, unique, varchar } from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../utils';
import { Files } from './file.sql';
import { Workspaces } from './workspace.sql';

export const FileFolders = pgTable(
	'FileFolders',
	{
		...primaryId,
		...timestamps,
		workspaceId: dbId('workspaceId')
			.notNull()
			.references(() => Workspaces.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade',
			}),
		name: varchar('name', { length: 255 }).notNull(),
		description: varchar('description', { length: 255 }),
		parentId: dbId('parentId').references((): AnyPgColumn => FileFolders.id, {
			onUpdate: 'cascade',
			onDelete: 'cascade',
		}),
	},
	folder => {
		return {
			workspace: index('FileFolders_workspace_idx').on(folder.workspaceId),
			uniqueName: unique('FileFolders_unique_name').on(
				folder.workspaceId,
				folder.parentId,
				folder.name,
			),
		};
	},
);

export const FileFolder_Relations = relations(FileFolders, ({ one, many }) => ({
	// one-to-many
	subfolders: many(FileFolders, {
		relationName: 'subfolders',
	}),
	// one-to-one
	parent: one(FileFolders, {
		fields: [FileFolders.parentId],
		references: [FileFolders.id],
		relationName: 'subfolders',
	}),
	// many-to-many
	files: many(Files),
}));

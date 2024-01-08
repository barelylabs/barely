import { relations } from 'drizzle-orm';
import { index, pgTable, varchar } from 'drizzle-orm/pg-core';

import { cuid, primaryId, timestamps } from '../utils/sql';
import { Workspaces } from './workspace.sql';

export const ExternalWebsites = pgTable(
	'ExternalWebsite',
	{
		// id: cuid('id').notNull(),
		...primaryId,
		workspaceId: cuid('workspaceId')
			.notNull()
			.references(() => Workspaces.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade',
			}),

		...timestamps,
		name: varchar('name', { length: 255 }).notNull(),
	},
	website => {
		return {
			// primary: primaryKey(website.workspaceId, website.id),
			workspace: index('ExternalWebsite_workspace_idx').on(website.workspaceId),
		};
	},
);

export const ExternalWebsite_Relations = relations(ExternalWebsites, ({ one }) => ({
	// one-to-many
	team: one(Workspaces, {
		fields: [ExternalWebsites.workspaceId],
		references: [Workspaces.id],
	}),
}));

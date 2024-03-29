import { relations } from 'drizzle-orm';
import { boolean, index, integer, pgTable, varchar } from 'drizzle-orm/pg-core';

import { dbId, primaryId } from '../utils/sql';
import { Audiences } from './audience.sql';
import { Workspaces } from './workspace.sql';

export const AudienceDemos = pgTable(
	'AudienceDemos',
	{
		// id: cuid('id').notNull(),
		...primaryId,
		workspaceId: dbId('workspaceId')
			.notNull()
			.references(() => Workspaces.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade',
			}),

		name: varchar('name', { length: 255 }).notNull(),
		ageMin: integer('ageMin').default(18).notNull(),
		ageMax: integer('ageMax').notNull(),
		gender: varchar('gender', {
			length: 255,
			enum: ['male', 'female', 'all'],
		}).notNull(),
		onlyEnglish: boolean('onlyEnglish').notNull(),
		public: boolean('public').default(false).notNull(),
	},
	demo => ({
		// primary: primaryKey(demo.workspaceId, demo.id),
		workspace: index('AudienceDemos_workspace_idx').on(demo.workspaceId),
	}),
);

export const AudienceDemo_Relations = relations(AudienceDemos, ({ one, many }) => ({
	team: one(Workspaces, {
		fields: [AudienceDemos.workspaceId],
		references: [Workspaces.id],
	}),
	audiences: many(Audiences),
}));

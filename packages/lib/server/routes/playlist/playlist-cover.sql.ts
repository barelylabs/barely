import { relations } from 'drizzle-orm';
import { boolean, index, integer, pgTable, varchar } from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../../../utils/sql';
import { Files } from '../file/file.sql';
import { Users } from '../user/user.sql';
import { Workspaces } from '../workspace/workspace.sql';

export const PlaylistCoverRenders = pgTable(
	'PlaylistCoverRenders',
	{
		// id: cuid('id').notNull(),
		...primaryId,
		workspaceId: dbId('workspaceId')
			.notNull()
			.references(() => Workspaces.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade',
			}),

		...timestamps,

		name: varchar('name', { length: 255 }),
		img: boolean('img').notNull(),
		imgSrc: varchar('imgSrc', { length: 255 }).notNull(),
		imgShift: boolean('imgShift').notNull(),
		imgShiftX: integer('imgShiftX').notNull(),
		imgShiftY: integer('imgShiftY').notNull(),
		imgScale: integer('imgScale').notNull(),
		text: boolean('text').notNull(),
		textColor: varchar('textColor', { length: 255 }).default('white').notNull(),
		textScale: integer('textScale').default(100).notNull(),
		textAlign: varchar('textAlign', { length: 255 }).default('center').notNull(),
		textShiftX: integer('textShiftX').default(0).notNull(),
		textShiftY: integer('textShiftY').default(0).notNull(),
		logo: boolean('logo').notNull(),
		logoColor: varchar('logoColor', { length: 255 }).default('white').notNull(),

		// relations
		createdById: dbId('createdById'),
		renderedCoverId: dbId('renderedCoverId'),
		playlistId: dbId('playlistId').notNull(),
	},
	table => {
		return {
			// primary: primaryKey(table.workspaceId, table.id),
			workspace: index('PlaylistCoverRenders_workspace_idx').on(table.workspaceId),
			playlist: index('PlaylistCoverRenders_playlist_idx').on(table.playlistId),
		};
	},
);

export const PlaylistCoverRender_Relations = relations(
	PlaylistCoverRenders,
	({ one }) => ({
		// one-to-many
		workspace: one(Workspaces, {
			fields: [PlaylistCoverRenders.workspaceId],
			references: [Workspaces.id],
		}),
		createdBy: one(Users, {
			fields: [PlaylistCoverRenders.createdById],
			references: [Users.id],
		}),
		renderedCover: one(Files, {
			fields: [PlaylistCoverRenders.renderedCoverId],
			references: [Files.id],
		}),
		playlist: one(Files, {
			fields: [PlaylistCoverRenders.playlistId],
			references: [Files.id],
		}),
	}),
);

import { relations } from 'drizzle-orm';
import { boolean, pgTable, primaryKey, varchar } from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../utils/sql';
import { Workspaces } from './routes/workspace/workspace.sql';
import { Tracks } from './track.sql';

export const Mixtapes = pgTable('Mixtapes', {
	...primaryId,
	workspaceId: dbId('workspaceId')
		.notNull()
		.references(() => Workspaces.id, {
			onUpdate: 'cascade',
			onDelete: 'cascade',
		}),
	...timestamps,

	name: varchar('name', { length: 255 }).notNull(),
	description: varchar('description', { length: 255 }),
	archived: boolean('archived').default(false),
});

export const MixtapeRelations = relations(Mixtapes, ({ one, many }) => ({
	workspace: one(Workspaces, {
		fields: [Mixtapes.workspaceId],
		references: [Workspaces.id],
	}),
	_tracks: many(_Mixtapes_To_Tracks),
}));

export const _Mixtapes_To_Tracks = pgTable(
	'_Mixtapes_To_Tracks',
	{
		// ...primaryId,
		mixtapeId: dbId('mixtapeId')
			.notNull()
			.references(() => Mixtapes.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade',
			}),
		trackId: dbId('trackId')
			.notNull()
			.references(() => Tracks.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade',
			}),
		...timestamps,
		lexorank: varchar('lexorank', { length: 255 }).notNull(),
	},
	table => ({
		pk: primaryKey({ columns: [table.mixtapeId, table.trackId] }),
	}),
);

export const MixtapeTrackRelations = relations(_Mixtapes_To_Tracks, ({ one }) => ({
	mixtape: one(Mixtapes, {
		fields: [_Mixtapes_To_Tracks.mixtapeId],
		references: [Mixtapes.id],
	}),
	track: one(Tracks, {
		fields: [_Mixtapes_To_Tracks.trackId],
		references: [Tracks.id],
	}),
}));

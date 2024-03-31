import { relations } from 'drizzle-orm';
import { index, integer, pgTable } from 'drizzle-orm/pg-core';

import { dbId, primaryId } from '../utils/sql';
import { Workspaces } from './routes/workspace/workspace.sql';
import { Tracks } from './track.sql';
import { Users } from './user.sql';

export const TrackRenders = pgTable(
	'TrackRenders',
	{
		...primaryId,
		workspaceId: dbId('workspaceId')
			.notNull()
			.references(() => Workspaces.id, {
				onDelete: 'cascade',
			}),

		trackTrimIn: integer('trackTrimIn').notNull(), // ms

		// relations
		createdById: dbId('createdById'),
		trackId: dbId('trackId').notNull(),
	},
	trackRender => {
		return {
			// primary: primaryKey(trackRender.workspaceId, trackRender.id),
			workspace: index('TrackRenders_workspace_idx').on(trackRender.workspaceId),
			trackIdIdx: index('TrackRenders_track_idx').on(trackRender.trackId),
		};
	},
);

export const TrackRender_Relations = relations(TrackRenders, ({ one }) => ({
	// one-to-many
	createdBy: one(Users, {
		fields: [TrackRenders.createdById],
		references: [Users.id],
	}),
	workspace: one(Workspaces, {
		fields: [TrackRenders.workspaceId],
		references: [Workspaces.id],
	}),
	track: one(Tracks, {
		fields: [TrackRenders.trackId],
		references: [Tracks.id],
	}),
}));

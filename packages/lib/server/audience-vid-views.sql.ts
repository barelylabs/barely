import { relations } from 'drizzle-orm';
import { index, integer, pgTable, varchar } from 'drizzle-orm/pg-core';

import { cuid, primaryId, timestamps } from '../utils/sql';
import { Audiences } from './audience.sql';
import { Workspaces } from './workspace.sql';

export const AudienceVidViewsGroups = pgTable(
	'AudienceVidViewsGroups',
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
		metric: varchar('metric', {
			length: 255,
			enum: ['view_1s', 'view_15s', 'view_60s'],
		}).notNull(),
		retention: varchar('retention', {
			length: 255,
			enum: ['day_1', 'day_3', 'day_7', 'day_30', 'day_365'],
		}).notNull(),

		metaId: varchar('metaId', { length: 255 }).notNull(),
		metaName: varchar('metaName', { length: 255 }).notNull(),
		metaAudienceLowerBound: integer('metaAudienceLowerBound').notNull(),
		metaAudienceUpperBound: integer('metaAudienceUpperBound').notNull(),
		tiktokId: varchar('tiktokId', { length: 255 }).notNull(),
		tiktokName: varchar('tiktokName', { length: 255 }).notNull(),
	},
	audienceVidViewsGroup => ({
		// primary: primaryKey(audienceVidViewsGroup.workspaceId, audienceVidViewsGroup.id),
		workspace: index('AudienceVidViewsGroups_workspace_idx').on(
			audienceVidViewsGroup.workspaceId,
		),
	}),
);

export const AudienceVidViewsGroups_Relations = relations(
	AudienceVidViewsGroups,
	({ one, many }) => ({
		workspace: one(Workspaces, {
			fields: [AudienceVidViewsGroups.workspaceId],
			references: [Workspaces.id],
		}),
		audiences: many(_AudienceVidViewsGroups_To_Audiences),
	}),
);

// joins

export const _AudienceVidViewsGroups_To_Audiences = pgTable(
	'_AudienceVidViewsGroups_To_Audiences',
	{
		vidViewsGroupId: cuid('vidViewsGroupId').notNull(),
		audienceId: cuid('audienceId').notNull(),
	},
);

export const _AudienceVidViewsGroups_To_Audiences_Relations = relations(
	_AudienceVidViewsGroups_To_Audiences,
	({ one }) => ({
		vidViewsGroup: one(AudienceVidViewsGroups, {
			fields: [_AudienceVidViewsGroups_To_Audiences.vidViewsGroupId],
			references: [AudienceVidViewsGroups.id],
		}),
		audience: one(Audiences, {
			fields: [_AudienceVidViewsGroups_To_Audiences.audienceId],
			references: [Audiences.id],
		}),
	}),
);

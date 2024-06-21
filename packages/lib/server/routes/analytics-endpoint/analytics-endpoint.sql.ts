import { relations } from 'drizzle-orm';
import { index, pgTable, primaryKey, varchar } from 'drizzle-orm/pg-core';

import { dbId } from '../../../utils/sql';
import { EventReports } from '../event/event-report.sql';
import { Workspaces } from '../workspace/workspace.sql';

export const AnalyticsEndpoints = pgTable(
	'AnalyticsEndpoints',
	{
		platform: varchar('platform', {
			length: 255,
			enum: ['meta', 'google', 'tiktok', 'snapchat'],
		}).notNull(),
		id: varchar('id', { length: 255 }).notNull(), // we'll use the id the platform gives us
		accessToken: varchar('accessToken', { length: 255 }),

		// relations
		workspaceId: dbId('workspaceId')
			.notNull()
			.references(() => Workspaces.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade',
			}),
	},
	endpoint => {
		return {
			primary: primaryKey({
				name: 'analyticsendpoints_platform_id_pk',
				columns: [endpoint.platform, endpoint.id],
			}),
			// workspacePlatformUnique: unique('workspace_platform_unique').on(
			// 	endpoint.workspaceId,
			// 	endpoint.platform,
			// ),
			workspacePlatformIdx: index('workspace_platform_idx').on(
				endpoint.workspaceId,
				endpoint.platform,
			),
		};
	},
);

export const AnalyticsEndpoint_Relations = relations(
	AnalyticsEndpoints,
	({ one, many }) => ({
		// one-to-many
		workspace: one(Workspaces, {
			fields: [AnalyticsEndpoints.workspaceId],
			references: [Workspaces.id],
		}),

		// many-to-one
		eventReports: many(EventReports),
	}),
);

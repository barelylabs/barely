import { relations } from 'drizzle-orm';
import { index, integer, pgTable, varchar } from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../../../utils/sql';
import { Workspaces } from '../workspace/workspace.sql';
import { AudienceDemos } from './audience-demo.sql';
import {
	_AudienceCountries_To_Audiences,
	_AudienceGeoGroups_To_Audiences,
} from './audience-geo.sql';
import {
	_AudienceInterestGroups_To_Audiences,
	_AudienceInterests_To_AudienceInterestGroups,
	_AudienceInterests_To_Audiences,
} from './audience-interest.sql';
import { _AudienceVidViewsGroups_To_Audiences } from './audience-vid-views.sql';

export const Audiences = pgTable(
	'Audiences',
	{
		...primaryId,
		workspaceId: dbId('workspaceId')
			.notNull()
			.references(() => Workspaces.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade',
			}),

		...timestamps,

		name: varchar('name', { length: 255 }),
		metaId: varchar('metaId', { length: 255 }),
		metaAudienceLowerBound: integer('metaAudienceLowerBound'),
		metaAudienceUpperBound: integer('metaAudienceUpperBound'),
		tiktokId: varchar('tiktokId', { length: 255 }),

		// relations
		demoId: dbId('demoId').notNull(),
	},
	table => {
		return {
			workspace: index('Audiences_workspace_idx').on(table.workspaceId),
		};
	},
);

export const Audience_Relations = relations(Audiences, ({ one, many }) => ({
	team: one(Workspaces, {
		fields: [Audiences.workspaceId],
		references: [Workspaces.id],
	}),

	// 🧑‍🤝‍🧑 age/gender
	demo: one(AudienceDemos, {
		fields: [Audiences.demoId],
		references: [AudienceDemos.id],
	}),

	// 🌎 geo
	countries: many(_AudienceCountries_To_Audiences),
	geoGroups: many(_AudienceGeoGroups_To_Audiences),

	// 💗 interests
	interests: many(_AudienceInterests_To_Audiences),
	interestGroups: many(_AudienceInterestGroups_To_Audiences),

	// 🐭 engagement
	vidViewsGroups: many(_AudienceVidViewsGroups_To_Audiences),
}));

import { relations } from 'drizzle-orm';
import { boolean, char, index, integer, pgTable, varchar } from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../utils/sql';
import { Audiences } from './audience.sql';
import { Workspaces } from './routes/workspace/workspace.sql';

// interests

export const AudienceInterests = pgTable('AudienceInterests', {
	...primaryId,
	...timestamps,
	name: varchar('name', { length: 255 }).notNull(),
	metaId: varchar('metaId', { length: 255 }).notNull(),
	metaTopic: varchar('metaTopic', { length: 255 }).notNull(),
	metaAudienceLowerBound: integer('metaAudienceLowerBound').notNull(),
	metaAudienceUpperBound: integer('metaAudienceUpperBound').notNull(),
});

export const AudienceInterest_Relations = relations(AudienceInterests, ({ many }) => ({
	// many-to-many
	audiences: many(_AudienceInterests_To_Audiences),
	audienceInterestGroups: many(_AudienceInterests_To_AudienceInterestGroups),
}));

// interest groups

export const AudienceInterestGroups = pgTable(
	'AudienceInterestGroups',
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

		name: varchar('name', { length: 255 }).notNull(),
		public: boolean('public').default(false).notNull(),
	},
	table => {
		return {
			// primary: primaryKey(table.workspaceId, table.id),
			workspace: index('AudienceInterestGroups_workspace_idx').on(table.workspaceId),
		};
	},
);

export const AudienceInterestGroup_Relations = relations(
	AudienceInterestGroups,
	({ one, many }) => ({
		workspace: one(Workspaces, {
			fields: [AudienceInterestGroups.workspaceId],
			references: [Workspaces.id],
		}),
		interests: many(_AudienceInterests_To_AudienceInterestGroups),
		audiences: many(_AudienceInterestGroups_To_Audiences),
	}),
);

// joins

export const _AudienceInterests_To_Audiences = pgTable('_AudienceInterest_To_Audience', {
	audienceInterestId: dbId('audienceInterestId').notNull(),
	audienceId: dbId('audienceId').notNull(),
	type: char('type', { length: 7, enum: ['include', 'exclude'] }).notNull(),
});

export const _AudienceInterests_To_Audiences_Relations = relations(
	_AudienceInterests_To_Audiences,
	({ one }) => ({
		audienceInterest: one(AudienceInterests, {
			fields: [_AudienceInterests_To_Audiences.audienceInterestId],
			references: [AudienceInterests.id],
		}),
		audience: one(Audiences, {
			fields: [_AudienceInterests_To_Audiences.audienceId],
			references: [Audiences.id],
		}),
	}),
);

export const _AudienceInterestGroups_To_Audiences = pgTable(
	'_AudienceInterestGroup_To_Audience',
	{
		audienceInterestGroupId: dbId('audienceInterestGroupId').notNull(),
		audienceId: dbId('audienceId').notNull(),
	},
);

export const _AudienceInterestGroup_To_Audience_Relations = relations(
	_AudienceInterestGroups_To_Audiences,
	({ one }) => ({
		audienceInterestGroup: one(AudienceInterestGroups, {
			fields: [_AudienceInterestGroups_To_Audiences.audienceInterestGroupId],
			references: [AudienceInterestGroups.id],
		}),
		audience: one(Audiences, {
			fields: [_AudienceInterestGroups_To_Audiences.audienceId],
			references: [Audiences.id],
		}),
	}),
);

export const _AudienceInterests_To_AudienceInterestGroups = pgTable(
	'_AudienceInterest_To_AudienceInterestGroup',
	{
		audienceInterestId: dbId('audienceInterestId').notNull(),
		audienceInterestGroupId: dbId('audienceInterestGroupId').notNull(),
	},
);

export const _AudienceInterests_To_AudienceInterestGroup_Relations = relations(
	_AudienceInterests_To_AudienceInterestGroups,
	({ one }) => ({
		audienceInterest: one(AudienceInterests, {
			fields: [_AudienceInterests_To_AudienceInterestGroups.audienceInterestId],
			references: [AudienceInterests.id],
		}),
		audienceInterestGroup: one(AudienceInterestGroups, {
			fields: [_AudienceInterests_To_AudienceInterestGroups.audienceInterestGroupId],
			references: [AudienceInterestGroups.id],
		}),
	}),
);

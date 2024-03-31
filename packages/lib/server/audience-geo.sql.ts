import { relations } from 'drizzle-orm';
import {
	boolean,
	index,
	integer,
	pgTable,
	primaryKey,
	varchar,
} from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../utils/sql';
import { Audiences } from './audience.sql';
import { Workspaces } from './routes/workspace/workspace.sql';

export const AudienceCountries = pgTable('AudienceCountries', {
	id: varchar('id', { length: 255 }).primaryKey().notNull(),
	name: varchar('name', { length: 255 }).notNull(),
	code: varchar('code', { length: 255 }).notNull(),

	color: varchar('color', {
		length: 255,
		enum: ['red', 'orange', 'yellow', 'green'],
	}).notNull(),
	trigger: boolean('trigger').notNull(),
	metaAudienceLowerBound: integer('metaAudienceLowerBound'),
	metaAudienceUpperBound: integer('metaAudienceUpperBound'),
});

export const AudienceCountry_Relations = relations(AudienceCountries, ({ many }) => ({
	audiences: many(_AudienceCountries_To_Audiences),
	audienceGeoGroups: many(_AudienceCountries_To_AudienceGeoGroups),
}));

export const AudienceGeoGroups = pgTable(
	'AudienceGeoGroups',
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
			workspace: index('AudienceGeoGroups_workspace_idx').on(table.workspaceId),
		};
	},
);

export const AudienceGeoGroup_Relations = relations(
	AudienceGeoGroups,
	({ one, many }) => ({
		workspace: one(Workspaces, {
			fields: [AudienceGeoGroups.workspaceId],
			references: [Workspaces.id],
		}),
		countries: many(_AudienceCountries_To_AudienceGeoGroups),
		audiences: many(_AudienceGeoGroups_To_Audiences),
	}),
);

// joins

// countries <-> geo groups

export const _AudienceCountries_To_AudienceGeoGroups = pgTable(
	'_AudienceCountries_To_AudienceGeoGroups',
	{
		audienceCountryId: dbId('audienceCountryId').notNull(),
		audienceGeoGroupId: dbId('audienceGeoGroupId').notNull(),
	},
	table => ({
		primary: primaryKey({
			columns: [table.audienceCountryId, table.audienceGeoGroupId],
		}),
	}),
);

export const _AudienceCountries_To_AudienceGeoGroups_Relations = relations(
	_AudienceCountries_To_AudienceGeoGroups,
	({ one }) => ({
		audienceCountry: one(AudienceCountries, {
			fields: [_AudienceCountries_To_AudienceGeoGroups.audienceCountryId],
			references: [AudienceCountries.id],
		}),
		audienceGeoGroup: one(AudienceGeoGroups, {
			fields: [_AudienceCountries_To_AudienceGeoGroups.audienceGeoGroupId],
			references: [AudienceGeoGroups.id],
		}),
	}),
);

// countries <-> audiences

export const _AudienceCountries_To_Audiences = pgTable(
	'_AudienceCountries_To_Audiences',
	{
		audienceCountryId: dbId('audienceCountryId').notNull(),
		audienceId: dbId('audienceId').notNull(),
	},
	table => ({
		primary: primaryKey(table.audienceCountryId, table.audienceId),
	}),
);

export const _AudienceCountries_To_Audiences_Relations = relations(
	_AudienceCountries_To_Audiences,
	({ one }) => ({
		audienceCountry: one(AudienceCountries, {
			fields: [_AudienceCountries_To_Audiences.audienceCountryId],
			references: [AudienceCountries.id],
		}),
		audience: one(Audiences, {
			fields: [_AudienceCountries_To_Audiences.audienceId],
			references: [Audiences.id],
		}),
	}),
);

// geo groups <-> audiences

export const _AudienceGeoGroups_To_Audiences = pgTable(
	'_AudienceGeoGroups_To_Audiences',
	{
		audienceGeoGroupId: dbId('audienceGeoGroupId').notNull(),
		audienceId: dbId('audienceId').notNull(),
	},
	table => ({
		primary: primaryKey(table.audienceGeoGroupId, table.audienceId),
	}),
);

export const _AudienceGeoGroups_To_Audiences_Relations = relations(
	_AudienceGeoGroups_To_Audiences,
	({ one }) => ({
		audienceGeoGroup: one(AudienceGeoGroups, {
			fields: [_AudienceGeoGroups_To_Audiences.audienceGeoGroupId],
			references: [AudienceGeoGroups.id],
		}),
		audience: one(Audiences, {
			fields: [_AudienceGeoGroups_To_Audiences.audienceId],
			references: [Audiences.id],
		}),
	}),
);

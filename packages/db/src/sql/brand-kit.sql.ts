import { relations } from 'drizzle-orm';
import {
	boolean,
	index,
	jsonb,
	pgTable,
	text,
	uniqueIndex,
	varchar,
} from 'drizzle-orm/pg-core';

import { dbId, id, timestamps } from '../utils';
import { Workspaces } from './workspace.sql';

export const BrandKits = pgTable(
	'BrandKits',
	{
		...id,
		workspaceId: dbId('workspaceId')
			.notNull()
			.references(() => Workspaces.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade',
			}),

		// Bio content
		longBio: text('longBio'),
		shortBio: text('shortBio'), // For social contexts like barely.bio
		location: varchar('location', { length: 255 }), // Location like "Brooklyn, NY"

		// Theme & Design System
		themeCategory: varchar('themeCategory', {
			length: 255,
			enum: ['classic', 'vibrant', 'cozy', 'bold', 'custom'],
		}).notNull(),

		// Appearance/Colors
		colorPreset: varchar('colorPreset', { length: 255 }).notNull(),
		colorScheme: jsonb('colorScheme')
			.$type<{
				colors: [string, string, string];
				mapping: {
					backgroundColor: 0 | 1 | 2;
					textColor: 0 | 1 | 2;
					buttonColor: 0 | 1 | 2;
					buttonTextColor: 0 | 1 | 2;
					buttonOutlineColor: 0 | 1 | 2;
					blockColor: 0 | 1 | 2;
					blockTextColor: 0 | 1 | 2;
					bannerColor: 0 | 1 | 2;
				};
			}>()
			.notNull(), // JSON for color mapping

		// Typography
		fontPreset: varchar('fontPreset', {
			length: 255,
			enum: [
				// Modern fonts
				'modern.cal',
				'modern.montserrat',
				'modern.bowlbyOne',
				'modern.anton',
				// Classic fonts
				'classic.playfairDisplay',
				'classic.playfairDisplaySc',
				'classic.cutive',
				'classic.libreBaskerville',
				// Creative fonts
				'creative.fredokaOne',
				'creative.yellowtail',
				'creative.permanentMarker',
				'creative.pacifico',
				// Logo fonts
				'logo.coda',
				'logo.miriamLibre',
				'logo.rammettoOne',
				'logo.gravitasOne',
				// Futuristic fonts
				'futuristic.museoModerno',
				'futuristic.audiowide',
				'futuristic.lexendZetta',
				'futuristic.unicaOne',
				// Custom
				'custom',
			],
		})
			.default('modern.cal')
			.notNull(),
		headingFont: text('headingFont').notNull(),
		bodyFont: text('bodyFont').notNull(),

		// Block/Button Styling
		blockStyle: varchar('blockStyle', {
			length: 255,
			enum: ['rounded', 'oval', 'square', 'full-width'],
		})
			.default('rounded')
			.notNull(),
		blockShadow: boolean('blockShadow').notNull(),
		blockOutline: boolean('blockOutline').default(false).notNull(),

		...timestamps,
	},
	table => ({
		workspaceIdx: uniqueIndex('BrandKits_workspaceId_key').on(table.workspaceId),
		primary: index('BrandKits_id_idx').on(table.id),
	}),
);

export const BrandKitsRelations = relations(BrandKits, ({ one }) => ({
	workspace: one(Workspaces, {
		fields: [BrandKits.workspaceId],
		references: [Workspaces.id],
	}),
}));

export type BrandKit = typeof BrandKits.$inferSelect;
export type InsertBrandKit = typeof BrandKits.$inferInsert;

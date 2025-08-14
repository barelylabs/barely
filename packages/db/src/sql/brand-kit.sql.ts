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

import { id, timestamps } from '../utils';
import { Workspaces } from './workspace.sql';

export const BrandKits = pgTable(
	'BrandKits',
	{
		...id,
		workspaceId: varchar('workspaceId', { length: 255 }).notNull(),

		// Bio content
		longBio: text('longBio'),
		shortBio: text('shortBio'), // For social contexts like barely.bio
		location: varchar('location', { length: 255 }), // Location like "Brooklyn, NY"

		// Theme & Design System
		themeKey: varchar('themeKey', { length: 255 }),
		themeCategory: varchar('themeCategory', {
			length: 255,
			enum: ['classic', 'vibrant', 'cozy', 'bold'],
		}),

		// Header/Layout
		// this shouldn't be here. it belongs in bio.sql
		// headerStyle: varchar('headerStyle', {
		// 	length: 255,
		// 	enum: ['minimal-centered', 'minimal-left', 'minimal-hero'],
		// })
		// 	.default('minimal-centered')
		// 	.notNull(),

		// Appearance/Colors
		appearancePreset: varchar('appearancePreset', { length: 255 }),
		colorScheme: jsonb('colorScheme').$type<{
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
		}>(), // JSON for color mapping

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
		headingFont: text('headingFont'),
		bodyFont: text('bodyFont'),

		// Block/Button Styling
		blockStyle: varchar('blockStyle', {
			length: 255,
			enum: ['rounded', 'oval', 'square', 'full-width'],
		})
			.default('rounded')
			.notNull(),
		blockShadow: boolean('blockShadow').default(false).notNull(),
		blockOutline: boolean('blockOutline').default(false).notNull(),

		// Future: Product-specific overrides
		// bioOverrides: text('bioOverrides'), // JSON
		// cartOverrides: text('cartOverrides'), // JSON
		// pageOverrides: text('pageOverrides'), // JSON

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

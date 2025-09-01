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
		handle: varchar('handle', { length: 255 }).references(() => Workspaces.handle, {
			onUpdate: 'cascade',
		}),

		avatarS3Key: varchar('avatarS3Key', { length: 255 }),
		avatarBlurDataUrl: varchar('avatarBlurDataUrl', { length: 255 }),
		headerS3Key: varchar('headerS3Key', { length: 255 }),
		headerBlurDataUrl: varchar('headerBlurDataUrl', { length: 255 }),

		// Bio content
		shortBio: text('shortBio'), // For social contexts like barely.bio
		longBio: text('longBio'),
		location: varchar('location', { length: 255 }), // Location like "Brooklyn, NY"

		// Theme & Design System
		themeCategory: varchar('themeCategory', {
			length: 255,
			enum: ['classic', 'vibrant', 'cozy', 'bold', 'custom'],
		}).notNull(),

		// Appearance/Colors
		colorPreset: varchar('colorPreset', { length: 255 }).notNull(),

		// Base colors (OKLCH format strings like "oklch(0.55 0.224 28)")
		color1: varchar('color1', { length: 255 }).notNull().default('oklch(0.00 0.000 0)'),
		color2: varchar('color2', { length: 255 }).notNull().default('oklch(0.60 0.000 0)'),
		color3: varchar('color3', { length: 255 }).notNull().default('oklch(1.00 0.000 0)'),

		// App-specific color mappings (index references to color1/2/3)
		bioColorScheme: jsonb('bioColorScheme')
			.$type<{
				bgColor: 0 | 1 | 2;
				textColor: 0 | 1 | 2;
				blockColor: 0 | 1 | 2;
				blockTextColor: 0 | 1 | 2;
				bannerColor: 0 | 1 | 2;
			}>()
			.notNull()
			.default({
				bgColor: 0,
				textColor: 1,
				blockColor: 2,
				blockTextColor: 0,
				bannerColor: 1,
			}),

		cartColorScheme: jsonb('cartColorScheme')
			.$type<{
				bgColor: 0 | 1 | 2;
				textColor: 0 | 1 | 2;
				blockColor: 0 | 1 | 2;
				blockTextColor: 0 | 1 | 2;
			}>()
			.notNull()
			.default({
				bgColor: 0,
				textColor: 1,
				blockColor: 2,
				blockTextColor: 0,
			}),

		// Legacy field for backwards compatibility (will be removed later)
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
			.notNull(), // Deprecated - kept for migration

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

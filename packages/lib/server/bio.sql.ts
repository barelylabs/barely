import { relations } from 'drizzle-orm';
import { boolean, index, pgTable, primaryKey, varchar } from 'drizzle-orm/pg-core';

import { cuid, primaryId, timestamps } from '../utils/sql';
import { Events } from './event.sql';
import { Forms } from './form.sql';
import { Links } from './link.sql';
import { Workspaces } from './workspace.sql';

// bio

export const Bios = pgTable(
	'Bios',
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

		// link structure
		handle: varchar('handle', { length: 255 })
			.notNull()
			.references(() => Workspaces.handle, {
				onUpdate: 'cascade',
			}),
		route: varchar('route', { length: 255 }),
		slug: varchar('slug', { length: 255 }),

		img: varchar('img', { length: 255 }),
		imgShape: varchar('imgShape', { length: 255, enum: ['square', 'circle', 'rounded'] }),
		title: varchar('title', { length: 255 }),
		subtitle: varchar('subtitle', { length: 255 }),
		titleColor: varchar('titleColor', { length: 255 }),
		buttonColor: varchar('buttonColor', { length: 255 }),
		iconColor: varchar('iconColor', { length: 255 }),
		textColor: varchar('textColor', { length: 255 }),
		socialDisplay: boolean('socialDisplay').notNull(),
		socialButtonColor: varchar('socialButtonColor', { length: 255 }),
		socialIconColor: varchar('socialIconColor', { length: 255 }),
		theme: varchar('theme', { length: 255, enum: ['light', 'dark', 'app'] })
			.default('light')
			.notNull(),
		barelyBranding: boolean('barelyBranding').default(true).notNull(),
	},
	bio => ({
		workspace: index('Bios_workspace_idx').on(bio.workspaceId),
		handle: index('Bios_handle_idx').on(bio.handle),
	}),
);

export const BioRelations = relations(Bios, ({ one, many }) => ({
	// one-to-many
	workspace: one(Workspaces, {
		fields: [Bios.workspaceId],
		references: [Workspaces.id],
	}),

	// many-to-one
	events: many(Events),

	// many-to-many
	bioButtons: many(_BioButtons_To_Bios),
}));

// bio button

export const BioButtons = pgTable(
	'BioButtons',
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

		linkId: cuid('linkId').references(() => Links.id, {
			onUpdate: 'cascade',
			onDelete: 'cascade',
		}),
		formId: cuid('formId').references(() => Forms.id, {
			onUpdate: 'cascade',
			onDelete: 'cascade',
		}),

		text: varchar('text', { length: 255 }).notNull(),
		buttonColor: varchar('buttonColor', { length: 255 }),
		textColor: varchar('textColor', { length: 255 }),
		email: varchar('email', { length: 255 }),
		phone: varchar('phone', { length: 255 }),
	},
	bioButton => ({
		// primary: primaryKey(bioButton.workspaceId, bioButton.id),
		workspace: index('BioButtons_workspace_idx').on(bioButton.workspaceId),
	}),
);

export const BioButtonRelations = relations(BioButtons, ({ one, many }) => ({
	// one-to-many
	form: one(Forms, {
		fields: [BioButtons.formId],
		references: [Forms.id],
	}),
	link: one(Links, {
		fields: [BioButtons.linkId],
		references: [Links.id],
	}),

	// many-to-many
	bios: many(_BioButtons_To_Bios),
}));

// joins

export const _BioButtons_To_Bios = pgTable(
	'_BioButtons_To_Bios',
	{
		bioId: cuid('bioId').notNull(),
		bioButtonId: cuid('bioButtonId').notNull(),
		lexoRank: varchar('lexoRank', { length: 255 }).notNull(),
	},
	bioButtonToBio => ({
		primary: primaryKey(bioButtonToBio.bioId, bioButtonToBio.bioButtonId),
	}),
);

export const _BioButtons_To_Bios_Relations = relations(
	_BioButtons_To_Bios,
	({ one }) => ({
		bio: one(Bios, {
			fields: [_BioButtons_To_Bios.bioId],
			references: [Bios.id],
		}),
		bioButton: one(BioButtons, {
			fields: [_BioButtons_To_Bios.bioButtonId],
			references: [BioButtons.id],
		}),
	}),
);

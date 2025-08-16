import { relations } from 'drizzle-orm';
import {
	boolean,
	index,
	pgTable,
	primaryKey,
	timestamp,
	varchar,
} from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../utils';
import { Events } from './event.sql';
import { Files } from './file.sql';
import { Forms } from './form.sql';
import { Links } from './link.sql';
import { Workspaces } from './workspace.sql';

// bio

export const Bios = pgTable(
	'Bios',
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

		// link structure
		handle: varchar('handle', { length: 255 })
			.notNull()
			.references(() => Workspaces.handle, {
				onUpdate: 'cascade',
			}),

		key: varchar('key', { length: 255 }).notNull().default('home'),

		imageFileId: dbId('imageFileId').references(() => Files.id, {
			onUpdate: 'cascade',
			onDelete: 'cascade',
		}),

		// Bio-specific settings (not moving to BrandKit)
		imgShape: varchar('imgShape', {
			length: 255,
			enum: ['square', 'circle', 'rounded'],
		}),
		socialDisplay: boolean('socialDisplay').notNull(),
		showLocation: boolean('showLocation').default(false).notNull(),
		showHeader: boolean('showHeader').default(true).notNull(),
		headerStyle: varchar('headerStyle', {
			length: 255,
			enum: ['minimal', 'banner', 'portrait', 'shapes'],
		})
			.default('minimal')
			.notNull(),
		blockShadow: boolean('blockShadow').default(false).notNull(),
		showShareButton: boolean('showShareButton').default(false).notNull(),
		showSubscribeButton: boolean('showSubscribeButton').default(false).notNull(),
		barelyBranding: boolean('barelyBranding').default(true).notNull(),

		// email capture settings
		emailCaptureEnabled: boolean('emailCaptureEnabled').default(false).notNull(),
		emailCaptureIncentiveText: varchar('emailCaptureIncentiveText', { length: 255 }),
	},
	bio => ({
		workspace: index('Bios_workspace_idx').on(bio.workspaceId),
		handle: index('Bios_handle_idx').on(bio.handle),
		workspaceKey: index('Bios_workspace_key_idx').on(bio.workspaceId, bio.key),
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
	bioButtons: many(_BioButtons_To_Bios), // Legacy - will be removed after migration
	bioBlocks: many(_BioBlocks_To_Bios),
}));

// bio button

export const BioButtons = pgTable(
	'BioButtons',
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

		linkId: dbId('linkId').references(() => Links.id, {
			onUpdate: 'cascade',
			onDelete: 'cascade',
		}),
		formId: dbId('formId').references(() => Forms.id, {
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
		bioId: dbId('bioId').notNull(),
		bioButtonId: dbId('bioButtonId').notNull(),
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

// Bio Blocks - New block-based system

export const BioBlocks = pgTable(
	'BioBlocks',
	{
		...primaryId,
		...timestamps,

		workspaceId: dbId('workspaceId')
			.notNull()
			.references(() => Workspaces.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade',
			}),

		type: varchar('type', {
			length: 50,
			enum: ['links', 'contactForm', 'cart'],
		}).notNull(),

		enabled: boolean('enabled').default(true).notNull(),

		name: varchar('name', { length: 255 }), // for internal user user
		title: varchar('title', { length: 255 }), // for rendering a title above the block
		subtitle: varchar('subtitle', { length: 255 }), // for rendering a subtitle below the block

		// Block-specific settings stored as JSON
		// settings: json('settings').$type<Record<string, unknown>>(),
	},
	bioBlock => ({
		workspace: index('BioBlocks_workspace_idx').on(bioBlock.workspaceId),
		type: index('BioBlocks_type_idx').on(bioBlock.type),
	}),
);

export const BioBlockRelations = relations(BioBlocks, ({ one, many }) => ({
	workspace: one(Workspaces, {
		fields: [BioBlocks.workspaceId],
		references: [Workspaces.id],
	}),

	// many-to-many
	bios: many(_BioBlocks_To_Bios),
	bioLinks: many(_BioLinks_To_BioBlocks),
}));

// Bio Links - Links within a links block

export const BioLinks = pgTable(
	'BioLinks',
	{
		...primaryId,
		...timestamps,

		workspaceId: dbId('workspaceId')
			.notNull()
			.references(() => Workspaces.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade',
			}),

		linkId: dbId('linkId').references(() => Links.id, {
			onUpdate: 'cascade',
			onDelete: 'cascade',
		}),

		formId: dbId('formId').references(() => Forms.id, {
			onUpdate: 'cascade',
			onDelete: 'cascade',
		}),

		title: varchar('title', { length: 255 }),
		subtitle: varchar('subtitle', { length: 255 }),
		url: varchar('url', { length: 255 }),

		animate: varchar('animate', {
			length: 255,
			enum: ['none', 'bounce', 'wobble', 'jello', 'pulse', 'shake', 'tada'],
		}).default('none'),
		text: varchar('text', { length: 255 }).notNull(),
		buttonColor: varchar('buttonColor', { length: 255 }),
		textColor: varchar('textColor', { length: 255 }),
		email: varchar('email', { length: 255 }),
		phone: varchar('phone', { length: 255 }),

		enabled: boolean('enabled').default(true).notNull(),

		startShowingAt: timestamp('startShowingAt'),
		stopShowingAt: timestamp('stopShowingAt'),
	},
	bioLink => ({
		workspace: index('BioLinks_workspace_idx').on(bioLink.workspaceId),
	}),
);

export const BioLinkRelations = relations(BioLinks, ({ one, many }) => ({
	workspace: one(Workspaces, {
		fields: [BioLinks.workspaceId],
		references: [Workspaces.id],
	}),
	link: one(Links, {
		fields: [BioLinks.linkId],
		references: [Links.id],
	}),
	form: one(Forms, {
		fields: [BioLinks.formId],
		references: [Forms.id],
	}),

	// many-to-many
	bioBlocks: many(_BioLinks_To_BioBlocks),
}));

// Join tables

export const _BioBlocks_To_Bios = pgTable(
	'_BioBlocks_To_Bios',
	{
		bioId: dbId('bioId').notNull(),
		bioBlockId: dbId('bioBlockId').notNull(),
		lexoRank: varchar('lexoRank', { length: 255 }).notNull(),
	},
	bioBlockToBio => ({
		primary: primaryKey(bioBlockToBio.bioId, bioBlockToBio.bioBlockId),
	}),
);

export const _BioBlocks_To_Bios_Relations = relations(_BioBlocks_To_Bios, ({ one }) => ({
	bio: one(Bios, {
		fields: [_BioBlocks_To_Bios.bioId],
		references: [Bios.id],
	}),
	bioBlock: one(BioBlocks, {
		fields: [_BioBlocks_To_Bios.bioBlockId],
		references: [BioBlocks.id],
	}),
}));

export const _BioLinks_To_BioBlocks = pgTable(
	'_BioLinks_To_BioBlocks',
	{
		bioBlockId: dbId('bioBlockId').notNull(),
		bioLinkId: dbId('bioLinkId').notNull(),
		lexoRank: varchar('lexoRank', { length: 255 }).notNull(),
	},
	bioLinkToBioBlock => ({
		primary: primaryKey(bioLinkToBioBlock.bioBlockId, bioLinkToBioBlock.bioLinkId),
	}),
);

export const _BioLinks_To_BioBlocks_Relations = relations(
	_BioLinks_To_BioBlocks,
	({ one }) => ({
		bioBlock: one(BioBlocks, {
			fields: [_BioLinks_To_BioBlocks.bioBlockId],
			references: [BioBlocks.id],
		}),
		bioLink: one(BioLinks, {
			fields: [_BioLinks_To_BioBlocks.bioLinkId],
			references: [BioLinks.id],
		}),
	}),
);

import {
	BIO_BLOCK_ANIMATION_TYPES,
	BIO_BLOCK_ICON_TYPES,
	BIO_BLOCK_TYPES,
	BIO_HEADER_STYLES,
	BIO_IMG_DESKTOP_SIDE,
	BIO_IMG_MOBILE_SIDE,
	BIO_IMG_SHAPES,
} from '@barely/const';
import { relations } from 'drizzle-orm';
import {
	boolean,
	index,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uniqueIndex,
	varchar,
} from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../utils';
import { CartFunnels } from './cart-funnel.sql';
import { Events } from './event.sql';
import { Files } from './file.sql';
import { FmPages } from './fm.sql';
import { Forms } from './form.sql';
import { Links } from './link.sql';
import { Workspaces } from './workspace.sql';

// bio

export const Bios = pgTable(
	'Bios',
	{
		...primaryId,

		workspaceId: dbId('workspaceId')
			.notNull()
			.references(() => Workspaces.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade',
			}),
		handle: varchar('handle', { length: 255 })
			.notNull()
			.references(() => Workspaces.handle, {
				onUpdate: 'cascade',
			}),

		...timestamps,

		// link structure
		key: varchar('key', { length: 255 }).notNull().default('home'),

		// Bio-specific settings (not moving to BrandKit)
		imgShape: varchar('imgShape', {
			length: 255,
			enum: BIO_IMG_SHAPES,
		}),
		socialDisplay: boolean('socialDisplay').notNull(),
		showLocation: boolean('showLocation').default(false).notNull(),
		showHeader: boolean('showHeader').default(true).notNull(),
		headerStyle: varchar('headerStyle', {
			length: 255,
			enum: BIO_HEADER_STYLES,
		})
			.default('minimal.centered')
			.notNull(),
		showShareButton: boolean('showShareButton').default(false).notNull(),
		showSubscribeButton: boolean('showSubscribeButton').default(false).notNull(),
		barelyBranding: boolean('barelyBranding').default(true).notNull(),

		// email capture settings
		emailCaptureEnabled: boolean('emailCaptureEnabled').default(false).notNull(),
		emailCaptureIncentiveText: varchar('emailCaptureIncentiveText', { length: 255 }),

		// layout settings
		hasTwoPanel: boolean('hasTwoPanel').default(false).notNull(),

		// SEO metadata
		title: varchar('title', { length: 255 }),
		description: text('description'),
		noindex: boolean('noindex').default(false),
	},
	bio => ({
		workspace: index('Bios_workspace_idx').on(bio.workspaceId),
		handle: index('Bios_handle_idx').on(bio.handle),
		workspaceKey: uniqueIndex('Bios_workspace_key_idx').on(bio.workspaceId, bio.key),
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
			enum: BIO_BLOCK_TYPES,
		}).notNull(),

		enabled: boolean('enabled').default(true).notNull(),
		styleAsButton: boolean('styleAsButton').default(false),

		name: varchar('name', { length: 255 }), // for internal user user
		title: varchar('title', { length: 255 }), // for rendering a title above the block
		subtitle: varchar('subtitle', { length: 255 }), // for rendering a subtitle below the block

		// Contact form block settings (for type='contactForm')
		// Email is always required (Fan.email is notNull), so no toggle needed
		smsCaptureEnabled: boolean('smsCaptureEnabled').default(true),

		// Markdown block fields
		markdown: text('markdown'), // markdown content for markdown and twoPanel blocks

		// Image block fields
		imageFileId: dbId('imageFileId').references(() => Files.id, {
			onUpdate: 'cascade',
			onDelete: 'set null',
		}),
		imageCaption: varchar('imageCaption', { length: 200 }),
		imageAltText: varchar('imageAltText', { length: 255 }),

		// Two-panel block fields
		imageMobileSide: varchar('imageMobileSide', {
			length: 10,
			enum: BIO_IMG_MOBILE_SIDE,
		}),
		imageDesktopSide: varchar('imageDesktopSide', {
			length: 10,
			enum: BIO_IMG_DESKTOP_SIDE,
		}),
		ctaText: varchar('ctaText', { length: 100 }),
		ctaAnimation: varchar('ctaAnimation', {
			length: 20,
			enum: BIO_BLOCK_ANIMATION_TYPES,
		}),
		ctaIcon: varchar('ctaIcon', {
			length: 20,
			enum: BIO_BLOCK_ICON_TYPES,
		}),
		// ctaShowIcon: boolean('ctaShowIcon').default(false),
		targetUrl: varchar('targetUrl', { length: 500 }), // Direct URL for CTA

		// Learn More link fields
		learnMoreText: varchar('learnMoreText', { length: 100 }), // Text for learn more link
		learnMoreUrl: varchar('learnMoreUrl', { length: 500 }), // Direct URL for learn more
		learnMoreBioId: dbId('learnMoreBioId').references(() => Bios.id, {
			onUpdate: 'cascade',
			onDelete: 'set null',
		}),

		// Multi-purpose asset references
		// For twoPanel blocks: these are CTA targets (only one should be set)
		// For cart blocks: cartFunnelId is the main reference
		// For future fm blocks: fmId would be the main reference
		targetLinkId: dbId('targetLinkId').references(() => Links.id, {
			onUpdate: 'cascade',
			onDelete: 'set null',
		}),
		targetBioId: dbId('targetBioId').references(() => Bios.id, {
			onUpdate: 'cascade',
			onDelete: 'set null',
		}),
		targetFmId: dbId('targetFmId'), // FM table reference (not imported yet)
		targetCartFunnelId: dbId('targetCartFunnelId').references(() => CartFunnels.id, {
			onUpdate: 'cascade',
			onDelete: 'set null',
		}),
	},
	bioBlock => ({
		workspace: index('BioBlocks_workspace_idx').on(bioBlock.workspaceId),
		type: index('BioBlocks_type_idx').on(bioBlock.type),
		imageFile: index('BioBlocks_imageFile_idx').on(bioBlock.imageFileId),
		cartFunnel: index('BioBlocks_cartFunnel_idx').on(bioBlock.targetCartFunnelId),
	}),
);

export const BioBlockRelations = relations(BioBlocks, ({ one, many }) => ({
	workspace: one(Workspaces, {
		fields: [BioBlocks.workspaceId],
		references: [Workspaces.id],
	}),

	// For image and two-panel blocks
	imageFile: one(Files, {
		fields: [BioBlocks.imageFileId],
		references: [Files.id],
	}),

	// Multi-purpose link reference (for twoPanel CTA or other uses)
	link: one(Links, {
		fields: [BioBlocks.targetLinkId],
		references: [Links.id],
	}),

	// Bio reference (for twoPanel CTA or future bio-to-bio links)
	linkedBio: one(Bios, {
		fields: [BioBlocks.targetBioId],
		references: [Bios.id],
	}),

	// Learn more bio reference
	learnMoreBio: one(Bios, {
		fields: [BioBlocks.learnMoreBioId],
		references: [Bios.id],
		relationName: 'learnMoreBio',
	}),

	// For cart block
	targetCartFunnel: one(CartFunnels, {
		fields: [BioBlocks.targetCartFunnelId],
		references: [CartFunnels.id],
	}),

	targetLink: one(Links, {
		fields: [BioBlocks.targetLinkId],
		references: [Links.id],
	}),

	targetBio: one(Bios, {
		fields: [BioBlocks.targetBioId],
		references: [Bios.id],
	}),

	targetFm: one(FmPages, {
		fields: [BioBlocks.targetFmId],
		references: [FmPages.id],
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
			enum: BIO_BLOCK_ANIMATION_TYPES,
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
	_image: many(_Files_To_BioLinks__Images, {
		relationName: '_bioLink_image',
	}),
}));

// Join tables

export const _BioBlocks_To_Bios = pgTable(
	'_BioBlocks_To_Bios',
	{
		bioId: dbId('bioId')
			.notNull()
			.references(() => Bios.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade',
			}),
		// handle: varchar('handle', { length: 255 }).notNull(),
		// key: varchar('key', { length: 255 }).notNull(),

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

// Join table for BioLink images
export const _Files_To_BioLinks__Images = pgTable(
	'_Files_To_BioLinks__Images',
	{
		fileId: dbId('fileId')
			.notNull()
			.references(() => Files.id, { onDelete: 'cascade' }),
		bioLinkId: dbId('bioLinkId')
			.notNull()
			.references(() => BioLinks.id, { onDelete: 'cascade' }),
	},
	table => ({
		pk: primaryKey({ columns: [table.fileId, table.bioLinkId] }),
	}),
);

export const _Files_To_BioLinks__Images_Relations = relations(
	_Files_To_BioLinks__Images,
	({ one }) => ({
		file: one(Files, {
			fields: [_Files_To_BioLinks__Images.fileId],
			references: [Files.id],
			relationName: '_image_bioLink',
		}),
		bioLink: one(BioLinks, {
			fields: [_Files_To_BioLinks__Images.bioLinkId],
			references: [BioLinks.id],
			relationName: '_bioLink_image',
		}),
	}),
);

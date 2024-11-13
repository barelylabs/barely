import { relations } from 'drizzle-orm';
import {
	boolean,
	index,
	integer,
	pgTable,
	text,
	uniqueIndex,
	varchar,
} from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../../../utils/sql';
import { CartFunnels } from '../cart-funnel/cart-funnel.sql';
import { Links } from '../link/link.sql';
import { PressKits } from '../press-kit/press-kit.sql';
import { Workspaces } from '../workspace/workspace.sql';

export const LandingPages = pgTable(
	'LandingPages',
	{
		...primaryId,
		...timestamps,
		workspaceId: dbId('workspaceId')
			.notNull()
			.references(() => Workspaces.id, {
				onDelete: 'cascade',
			}),
		handle: varchar('handle', { length: 255 })
			.notNull()
			.references(() => Workspaces.handle, {
				onUpdate: 'cascade',
			}),

		name: varchar('name', { length: 255 }).notNull(),
		key: varchar('key', { length: 255 }).notNull(),

		// settings
		archived: boolean('archived').default(false),

		// meta tags
		metaTitle: varchar('metaTitle', { length: 255 }),
		metaDescription: text('metaDescription'),
		metaKeywords: varchar('metaKeywords', { length: 255 }),
		metaImage: varchar('metaImage', { length: 255 }),

		// content
		content: text('content'),

		// stats
		views: integer('views').default(0),
		clicks: integer('clicks').default(0),
		value: integer('value').default(0),
	},
	lp => ({
		workspace: index('lp_workspaceId_idx').on(lp.workspaceId),
		handle: uniqueIndex('lp_handle_key_idx').on(lp.handle, lp.key),
	}),
);

export const LandingPage_Relations = relations(LandingPages, ({ one, many }) => ({
	workspace: one(Workspaces, {
		fields: [LandingPages.workspaceId],
		references: [Workspaces.id],
	}),
	_cartFunnels: many(_LandingPage_To_CartFunnels),
	_pressKits: many(_LandingPage_To_PressKit),
	_landingPageSources: many(_LandingPage_To_LandingPage, {
		relationName: 'landingPageSource',
	}),
	_landingPageDestinations: many(_LandingPage_To_LandingPage, {
		relationName: 'landingPageDestination',
	}),
	_links: many(_LandingPage_To_Link),
}));

// CartFunnel Join
export const _LandingPage_To_CartFunnels = pgTable('_LandingPage_To_CartFunnels', {
	landingPageId: dbId('landingPageId').references(() => LandingPages.id, {
		onDelete: 'cascade',
	}),

	cartFunnelId: dbId('cartFunnelId').references(() => CartFunnels.id, {
		onDelete: 'cascade',
	}),
});

export const _LandingPage_To_CartFunnels_Relations = relations(
	_LandingPage_To_CartFunnels,
	({ one }) => ({
		landingPage: one(LandingPages, {
			fields: [_LandingPage_To_CartFunnels.landingPageId],
			references: [LandingPages.id],
		}),

		cartFunnel: one(CartFunnels, {
			fields: [_LandingPage_To_CartFunnels.cartFunnelId],
			references: [CartFunnels.id],
		}),
	}),
);

// PressKit Join
export const _LandingPage_To_PressKit = pgTable('_LandingPage_To_PressKit', {
	landingPageId: dbId('landingPageId').references(() => LandingPages.id, {
		onDelete: 'cascade',
	}),

	pressKitId: dbId('pressKitId').references(() => PressKits.id, {
		onDelete: 'cascade',
	}),
});

export const _LandingPage_To_PressKit_Relations = relations(
	_LandingPage_To_PressKit,
	({ one }) => ({
		landingPage: one(LandingPages, {
			fields: [_LandingPage_To_PressKit.landingPageId],
			references: [LandingPages.id],
		}),

		pressKit: one(PressKits, {
			fields: [_LandingPage_To_PressKit.pressKitId],
			references: [PressKits.id],
		}),
	}),
);

// LandingPage Join
export const _LandingPage_To_LandingPage = pgTable('_LandingPage_To_LandingPage', {
	landingPageSourceId: dbId('landingPageParentId').references(() => LandingPages.id, {
		onDelete: 'cascade',
	}),

	landingPageDestinationId: dbId('landingPageDestinationId').references(
		() => LandingPages.id,
		{
			onDelete: 'cascade',
		},
	),
});

export const _LandingPage_To_LandingPage_Relations = relations(
	_LandingPage_To_LandingPage,
	({ one }) => ({
		landingPageSource: one(LandingPages, {
			fields: [_LandingPage_To_LandingPage.landingPageSourceId],
			references: [LandingPages.id],
			relationName: 'landingPageSource',
		}),

		landingPageDestination: one(LandingPages, {
			fields: [_LandingPage_To_LandingPage.landingPageDestinationId],
			references: [LandingPages.id],
			relationName: 'landingPageDestination',
		}),
	}),
);
// Link Join
export const _LandingPage_To_Link = pgTable('_LandingPage_To_Link', {
	landingPageId: dbId('landingPageId').references(() => LandingPages.id, {
		onDelete: 'cascade',
	}),

	linkId: dbId('linkId').references(() => Links.id, {
		onDelete: 'cascade',
	}),
});

export const _LandingPage_To_Link_Relations = relations(
	_LandingPage_To_Link,
	({ one }) => ({
		landingPage: one(LandingPages, {
			fields: [_LandingPage_To_Link.landingPageId],
			references: [LandingPages.id],
		}),

		link: one(Links, {
			fields: [_LandingPage_To_Link.linkId],
			references: [Links.id],
		}),
	}),
);

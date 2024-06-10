import { relations } from 'drizzle-orm';
import { boolean, index, pgTable, text, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../../../utils/sql';
import { CartFunnels } from '../cart-funnel/cart-funnel.sql';
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
	cartFunnels: many(_LandingPage_To_CartFunnels),
}));

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

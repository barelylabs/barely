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

import { dbId, primaryId, timestamps } from '../utils';
import { Carts } from './cart.sql';
import { Products } from './product.sql';
import { Workspaces } from './workspace.sql';

export const CartFunnels = pgTable(
	'CartFunnels',
	{
		...primaryId,
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
		...timestamps,

		name: varchar('name', { length: 255 }).notNull(),
		key: varchar('key', { length: 255 }).notNull(),

		// funnel settings
		archived: boolean('archived').default(false),

		// main product
		mainProductId: dbId('mainProductId')
			.notNull()
			.references(() => Products.id),
		mainProductPayWhatYouWant: boolean('mainProductPayWhatYouWant').default(false), // if true, minimum price set to mainProduct.price ?? 0
		mainProductPayWhatYouWantMin: integer('mainProductPayWhatYouWantMin').default(0), // if undefined, default to 0
		mainProductDiscount: integer('mainProductDiscount').default(0), // if undefined, default to 0
		mainProductHandling: integer('mainProductHandling').default(0), // added to shipping cost for s&h

		// bump product
		bumpProductId: dbId('bumpProductId').references(() => Products.id),
		bumpProductHeadline: varchar('bumpProductHeadline', { length: 255 }),
		bumpProductDiscount: integer('bumpProductDiscount').default(0), // if undefined, default to 0
		bumpProductDescription: varchar('bumpProductDescription', { length: 255 }),

		// upsell product
		upsellProductId: dbId('upsellProductId').references(() => Products.id),
		upsellProductDiscount: integer('upsellProductDiscount').default(0).default(0), // if undefined, default to 0
		upsellProductHeadline: varchar('upsellProductHeadline', { length: 255 }),
		upsellProductAboveTheFold: text('upsellProductAboveTheFold'),
		upsellProductBelowTheFold: text('upsellProductBelowTheFold'),

		// success page
		successPageHeadline: varchar('successPageHeadline', { length: 255 }),
		successPageContent: text('successPageDescription'),
		successPageCTA: varchar('successPageCTA', { length: 255 }),
		successPageCTALink: varchar('successPageCTALink', { length: 255 }),

		// metrics
		count_viewLandingPage: integer('count_viewLandingPage').default(0),
		count_initiateCheckout: integer('count_initiateCheckout').default(0),
		count_addPaymentInfo: integer('count_addPaymentInfo').default(0),
		count_addBump: integer('count_addBump').default(0),
		count_removeBump: integer('count_removeBump').default(0),
		count_purchaseMainWithoutBump: integer('count_purchaseMainWithoutBump').default(0),
		count_purchaseMainWithBump: integer('count_purchaseMainWithBump').default(0),
		count_viewUpsell: integer('count_viewUpsell').default(0),
		count_declineUpsell: integer('count_declineUpsell').default(0),
		count_purchaseUpsell: integer('count_purchaseUpsell').default(0),
		count_viewOrderConfirmation: integer('count_viewOrderConfirmation').default(0),

		// stats
		value: integer('value').default(0),
	},
	funnel => ({
		workspace: index('Funnels_workspaceId_idx').on(funnel.workspaceId),
		handleKey: uniqueIndex('Funnels_handle_key').on(funnel.handle, funnel.key),
	}),
);

export const CartFunnel_Relations = relations(CartFunnels, ({ one, many }) => ({
	// one-to-one
	workspace: one(Workspaces, {
		fields: [CartFunnels.workspaceId],
		references: [Workspaces.id],
	}),

	// one-to-many
	mainProduct: one(Products, {
		relationName: 'funnelToMainProduct',
		fields: [CartFunnels.mainProductId],
		references: [Products.id],
	}),
	bumpProduct: one(Products, {
		relationName: 'funnelToBumpProduct',
		fields: [CartFunnels.bumpProductId],
		references: [Products.id],
	}),
	upsellProduct: one(Products, {
		relationName: 'funnelToUpsellProduct',
		fields: [CartFunnels.upsellProductId],
		references: [Products.id],
	}),

	// many-to-one
	_carts: many(Carts),
}));

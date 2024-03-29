import { relations } from 'drizzle-orm';
import {
	boolean,
	date,
	integer,
	pgTable,
	primaryKey,
	text,
	varchar,
} from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../utils/sql';
import { CartFunnels } from './cart-funnel.sql';
import { _Files_To_Products__Images } from './file.sql';
import { MERCH_TYPES } from './product.constants';
import { Workspaces } from './workspace.sql';

export const Products = pgTable('Products', {
	...primaryId,
	workspaceId: dbId('workspaceId')
		.notNull()
		.references(() => Workspaces.id, {
			onDelete: 'cascade',
		}),
	...timestamps,
	archived: boolean('archived').default(false),

	name: varchar('name', { length: 255 }).notNull(),
	description: text('description'),
	price: integer('price').notNull(),
	preorder: boolean('preorder').default(false),
	preorderDeliveryEstimate: date('preorderDeliveryEstimate', { mode: 'date' }),

	merchType: varchar('merchType', { length: 255, enum: MERCH_TYPES })
		.default('cd')
		.notNull(),

	stock: integer('stock'),

	// shipping dimensions
	weight: integer('weight').default(0),
	width: integer('width').default(0),
	length: integer('length').default(0),
	height: integer('height').default(0),
});

export const Product_Relations = relations(Products, ({ one, many }) => ({
	// one-to-many
	workspace: one(Workspaces, {
		fields: [Products.workspaceId],
		references: [Workspaces.id],
	}),

	// many-to-many
	funnel_main: many(CartFunnels, { relationName: 'funnelToMainProduct' }),
	funnel_bump: many(CartFunnels, { relationName: 'funnelToBumpProduct' }),
	funnel_upsell: many(CartFunnels, { relationName: 'funnelToUpsellProduct' }),

	_images: many(_Files_To_Products__Images, {
		relationName: '_product_image',
	}),
	_apparelSizes: many(ApparelSizes),
}));

export const ApparelSizes = pgTable(
	'ApparelSizes',
	{
		productId: dbId('productId')
			.notNull()
			.references(() => Products.id, {
				onDelete: 'cascade',
			}),
		...timestamps,

		size: varchar('size', {
			length: 25,
			enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
		}).notNull(),

		stock: integer('stock'),
	},
	table => ({
		pk: primaryKey({ columns: [table.productId, table.size] }),
		// index: index('productSizeIndex').on(table.productId, table.size),
	}),
);

export const ApparelSizes_Relations = relations(ApparelSizes, ({ one }) => ({
	product: one(Products, {
		fields: [ApparelSizes.productId],
		references: [Products.id],
	}),
}));

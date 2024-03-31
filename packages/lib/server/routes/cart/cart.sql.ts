import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../../../utils/sql';
import { CartFunnels } from '../../cart-funnel.sql';
import { Fans } from '../../fan.sql';
import { APPAREL_SIZES } from '../../product.constants';
import { Products } from '../../product.sql';
import { Workspaces } from '../workspace/workspace.sql';

export const CART_STAGES = [
	'mainCreated',
	'mainConverted',
	'mainAbandoned',
	'upsellCreated',
	'upsellDeclined',
	'upsellConverted',
	'upsellAbandoned',
] as const;

export const Carts = pgTable('Carts', {
	...primaryId,

	workspaceId: dbId('workspaceId')
		.notNull()
		.references(() => Workspaces.id),
	...timestamps,
	completedAt: timestamp('completedAt'),
	funnelId: dbId('funnelId').references(() => CartFunnels.id),

	status: varchar('status', {
		length: 255,
		enum: ['created', 'abandoned', 'pending', 'converted'],
	}).default('created'),

	stage: varchar('stage', {
		length: 255,
		enum: CART_STAGES,
	}),

	/* 
            🛒 main cart 
    */
	// stripe (on creation)
	mainStripePaymentIntentId: varchar('mainStripePaymentIntentId', {
		length: 255,
	}).notNull(),
	mainStripeClientSecret: varchar('mainStripeClientSecret', { length: 255 }).notNull(),

	// main product (determined by client inputs/set by server)
	mainProductId: dbId('mainProductId')
		.notNull()
		.references(() => Products.id),
	mainProductPrice: integer('mainProductPrice').notNull(),
	mainProductPayWhatYouWantPrice: integer('mainProductPayWhatYouWantPrice'),
	mainProductApparelSize: varchar('mainProductApparelSize', {
		length: 25,
		enum: APPAREL_SIZES,
	}),
	mainProductQuantity: integer('mainProductQuantity').notNull(),
	mainProductAmount: integer('mainProductAmount').notNull(),
	mainProductShippingAmount: integer('mainProductShippingAmount'),
	mainProductHandlingAmount: integer('mainProductHandlingAmount'),
	mainProductShippingAndHandlingAmount: integer('mainProductShippingAndHandlingAmount'),

	// bump product (determined by client inputs/set by server)
	addedBumpProduct: boolean('addedBumpProduct').default(false),
	bumpProductId: dbId('bumpProductId').references(() => Products.id),
	bumpProductPrice: integer('bumpProductPrice'),
	bumpProductApparelSize: varchar('bumpProductApparelSize', {
		length: 25,
		enum: APPAREL_SIZES,
	}),
	bumpProductQuantity: integer('bumpProductQuantity'),
	bumpProductAmount: integer('bumpProductAmount'),
	bumpProductShippingPrice: integer('bumpProductShippingPrice'),
	bumpProductShippingAndHandlingAmount: integer('bumpProductShippingAndHandlingAmount'),

	// main cart totals
	mainPlusBumpShippingAndHandlingAmount: integer('mainPlusBumpShippingAndHandlingAmount'),
	mainPlusBumpAmount: integer('mainPlusBumpAmount').notNull(),

	// fan
	email: varchar('email', { length: 255 }),
	firstName: varchar('firstName', { length: 255 }),
	lastName: varchar('lastName', { length: 255 }),
	fullName: varchar('fullName', { length: 255 }),
	phone: varchar('phone', { length: 255 }),

	marketingOptIn: boolean('marketingOptIn').default(false),
	shippingAddressLine1: varchar('shippingAddressLine1', { length: 255 }),
	shippingAddressLine2: varchar('shippingAddressLine2', { length: 255 }),
	shippingAddressCity: varchar('shippingAddressCity', { length: 255 }),
	shippingAddressState: varchar('shippingAddressState', { length: 255 }),
	shippingAddressPostalCode: varchar('shippingAddressPostalCode', { length: 255 }),
	shippingAddressCountry: varchar('shippingAddressCountry', { length: 255 }),

	// -> on conversion
	fanId: dbId('fanId').references(() => Fans.id),
	mainStripeChargeId: varchar('mainStripeChargeId', { length: 255 }),
	mainStripePaymentMethodId: varchar('mainStripePaymentMethodId', { length: 255 }),
	upsellCreatedAt: timestamp('upsellCreatedAt'),

	/* 
    🛒 upsell cart 
    */

	// stripe (on creation)
	upsellStripePaymentIntentId: varchar('upsellStripePaymentIntentId', {
		length: 255,
	}),

	// client inputs/mutations
	upsellProductId: dbId('upsellProductId').references(() => Products.id),
	upsellProductPrice: integer('upsellProductPrice'),
	upsellProductApparelSize: varchar('upsellProductApparelSize', {
		length: 25,
		enum: APPAREL_SIZES,
	}),
	upsellProductQuantity: integer('upsellProductQuantity'),
	upsellProductAmount: integer('upsellProductAmount'),
	upsellProductShippingPrice: integer('upsellProductShippingPrice'),

	// upsell cart totals
	upsellShippingAmount: integer('upsellShippingAmount'),
	upsellAmount: integer('upsellAmount'),

	// stripe (on conversion)
	upsellStripeChargeId: varchar('upsellStripeChargeId', { length: 255 }),

	/* totals */
	shippingAndHandlingAmount: integer('shippingAndHandlingAmount'),
	amount: integer('amount').notNull(),
	receiptSent: boolean('receiptSent').default(false),
});

export const Cart_Relations = relations(Carts, ({ one }) => ({
	// one-to-many
	workspace: one(Workspaces, {
		fields: [Carts.workspaceId],
		references: [Workspaces.id],
	}),
	funnel: one(CartFunnels, {
		fields: [Carts.funnelId],
		references: [CartFunnels.id],
	}),
	fan: one(Fans, {
		fields: [Carts.fanId],
		references: [Fans.id],
	}),
	mainProduct: one(Products, {
		fields: [Carts.mainProductId],
		references: [Products.id],
		relationName: 'mainProduct',
	}),
	bumpProduct: one(Products, {
		fields: [Carts.bumpProductId],
		references: [Products.id],
		relationName: 'bumpProduct',
	}),
	upsellProduct: one(Products, {
		fields: [Carts.upsellProductId],
		references: [Products.id],
		relationName: 'upsellProduct',
	}),
}));

// joins
// export const _Cart_To_Products = pgTable('_Cart_To_Products', {
// 	orderId: dbId('orderId')
// 		.notNull()
// 		.references(() => Carts.id),
// 	productId: dbId('productId')
// 		.notNull()
// 		.references(() => Workspaces.id),
// 	price: integer('price').notNull(),
// 	quantity: dbId('quantity').notNull(),
// 	size: varchar('size', { length: 25, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] }),
// });

// export const _Cart_To_Products_Relations = relations(_Cart_To_Products, ({ one }) => ({
// 	// one-to-many
// 	cart: one(Carts, {
// 		fields: [_Cart_To_Products.orderId],
// 		references: [Carts.id],
// 	}),
// 	product: one(Products, {
// 		fields: [_Cart_To_Products.productId],
// 		references: [Products.id],
// 	}),
// }));

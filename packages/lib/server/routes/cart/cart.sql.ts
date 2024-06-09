import { relations } from 'drizzle-orm';
import {
	boolean,
	integer,
	jsonb,
	pgTable,
	primaryKey,
	timestamp,
	uniqueIndex,
	varchar,
} from 'drizzle-orm/pg-core';

import type { NextFormattedUserAgent, NextGeo } from '../../next/next.schema';
import { dbId, primaryId, timestamps } from '../../../utils/sql';
import { CartFunnels } from '../cart-funnel/cart-funnel.sql';
import { Fans } from '../fan/fan.sql';
import { APPAREL_SIZES } from '../product/product.constants';
import { Products } from '../product/product.sql';
import { Workspaces } from '../workspace/workspace.sql';

export const CART_STAGES = [
	'checkoutCreated',
	'checkoutAbandoned',
	'checkoutConverted',
	'upsellCreated',
	'upsellDeclined',
	'upsellConverted',
	'upsellAbandoned',
] as const;

export const Carts = pgTable(
	'Carts',
	{
		...primaryId,

		workspaceId: dbId('workspaceId')
			.notNull()
			.references(() => Workspaces.id),
		...timestamps,

		cartFunnelId: dbId('cartFunnelId').references(() => CartFunnels.id),
		stage: varchar('stage', {
			length: 255,
			enum: CART_STAGES,
		}),

		/* landing page */
		landingPageId: dbId('landingPageId'),

		/* 
            🛒 cart checkout (main + bump) 
        */

		visitorIp: varchar('visitorIp', { length: 255 }),
		visitorGeo: jsonb('visitorGeo').$type<Partial<NextGeo>>(),
		visitorUserAgent: jsonb('visitorUserAgent').$type<Partial<NextFormattedUserAgent>>(),
		visitorIsBot: boolean('visitorIsBot').default(false),
		visitorReferer: varchar('visitorReferer', { length: 255 }),
		visitorRefererUrl: varchar('visitorRefererUrl', { length: 255 }),

		visitorCheckoutHref: varchar('visitorCheckoutHref', { length: 255 }),

		// stripe (on creation)
		checkoutStripePaymentIntentId: varchar('checkoutStripePaymentIntentId', {
			length: 255,
		}).notNull(),
		checkoutStripeClientSecret: varchar('checkoutStripeClientSecret', {
			length: 255,
		}).notNull(),

		// main product (determined by client inputs/set by server)
		mainProductId: dbId('mainProductId')
			.notNull()
			.references(() => Products.id),
		mainProductPrice: integer('mainProductPrice').notNull(),
		mainProductPayWhatYouWant: boolean('mainProductPayWhatYouWant').default(false),
		mainProductPayWhatYouWantPrice: integer('mainProductPayWhatYouWantPrice'),
		mainProductApparelSize: varchar('mainProductApparelSize', {
			length: 25,
			enum: APPAREL_SIZES,
		}),
		mainProductQuantity: integer('mainProductQuantity').notNull(),
		mainProductAmount: integer('mainProductAmount').notNull(),
		mainShippingAmount: integer('mainShippingAmount'),
		mainHandlingAmount: integer('mainHandlingAmount'),
		mainShippingAndHandlingAmount: integer('mainShippingAndHandlingAmount'),

		// bump product (determined by client inputs/set by server)
		bumpProductId: dbId('bumpProductId').references(() => Products.id),
		bumpProductPrice: integer('bumpProductPrice'),
		bumpShippingPrice: integer('bumpShippingPrice'),
		bumpHandlingPrice: integer('bumpHandlingPrice'),
		addedBump: boolean('addedBump').default(false),
		bumpProductApparelSize: varchar('bumpProductApparelSize', {
			length: 25,
			enum: APPAREL_SIZES,
		}),
		bumpProductQuantity: integer('bumpProductQuantity'),
		bumpProductAmount: integer('bumpProductAmount'),
		bumpShippingAmount: integer('bumpShippingAmount'),
		bumpHandlingAmount: integer('bumpHandlingAmount'),
		bumpShippingAndHandlingAmount: integer('bumpShippingAndHandlingAmount'),

		// checkout totals
		checkoutProductAmount: integer('checkoutProductAmount'),
		checkoutShippingAmount: integer('checkoutShippingAmount'),
		checkoutHandlingAmount: integer('checkoutHandlingAmount'),
		checkoutShippingAndHandlingAmount: integer('checkoutShippingAndHandlingAmount'),
		checkoutAmount: integer('checkoutAmount').notNull(),

		// fan
		email: varchar('email', { length: 255 }),
		fullName: varchar('fullName', { length: 255 }),
		firstName: varchar('firstName', { length: 255 }),
		lastName: varchar('lastName', { length: 255 }),
		phone: varchar('phone', { length: 255 }),
		shippingAddressLine1: varchar('shippingAddressLine1', { length: 255 }),
		shippingAddressLine2: varchar('shippingAddressLine2', { length: 255 }),
		shippingAddressCity: varchar('shippingAddressCity', { length: 255 }),
		shippingAddressState: varchar('shippingAddressState', { length: 255 }),
		shippingAddressPostalCode: varchar('shippingAddressPostalCode', { length: 255 }),
		shippingAddressCountry: varchar('shippingAddressCountry', { length: 255 }),
		marketingOptIn: boolean('marketingOptIn').default(false),

		emailMarketingOptIn: boolean('emailMarketingOptIn').default(false),
		smsMarketingOptIn: boolean('smsMarketingOptIn').default(false),

		// -> on conversion
		fanId: dbId('fanId').references(() => Fans.id),
		orderId: integer('orderId'),
		checkoutStripeChargeId: varchar('checkoutStripeChargeId', { length: 255 }),
		checkoutStripePaymentMethodId: varchar('checkoutStripePaymentMethodId', {
			length: 255,
		}),
		checkoutConvertedAt: timestamp('checkoutConvertedAt'),

		/* 
    🛒 upsell cart 
    */

		// client inputs/mutations
		upsellProductId: dbId('upsellProductId').references(() => Products.id),
		upsellProductPrice: integer('upsellProductPrice'),
		upsellProductApparelSize: varchar('upsellProductApparelSize', {
			length: 25,
			enum: APPAREL_SIZES,
		}),
		upsellShippingPrice: integer('upsellShippingPrice'),
		upsellHandlingPrice: integer('upsellHandlingPrice'),
		upsellProductQuantity: integer('upsellProductQuantity'),

		// upsell cart totals
		upsellProductAmount: integer('upsellProductAmount'),
		upsellShippingAmount: integer('upsellShippingAmount'),
		upsellHandlingAmount: integer('upsellHandlingAmount'),
		upsellShippingAndHandlingAmount: integer('upsellShippingAndHandlingAmount'),
		upsellAmount: integer('upsellAmount'),
		upsellConvertedAt: timestamp('upsellConvertedAt'),

		// stripe (on conversion)
		upsellStripePaymentIntentId: varchar('upsellStripePaymentIntentId', {
			length: 255,
		}),
		upsellStripeChargeId: varchar('upsellStripeChargeId', { length: 255 }),

		/* totals */
		orderProductAmount: integer('orderProductAmount'),
		orderShippingAmount: integer('orderShippingAmount'),
		orderHandlingAmount: integer('orderHandlingAmount'),
		orderShippingAndHandlingAmount: integer('orderShippingAndHandlingAmount'),
		orderAmount: integer('orderAmount').notNull(),

		orderReceiptSent: boolean('orderReceiptSent').default(false),

		// fulfillment
		fulfillmentStatus: varchar('fulfillmentStatus', {
			length: 255,
			enum: ['pending', 'partially_fulfilled', 'fulfilled'],
		})
			.notNull()
			.default('pending'),
		fulfilledAt: timestamp('fulfilledAt'),

		shippingCarrier: varchar('shippingCarrier', { length: 255 }),
		shippingTrackingNumber: varchar('shippingTrackingNumber', { length: 255 }),
		shippedAt: timestamp('shippedAt'),
	},

	cart => ({
		workspaceOrderId: uniqueIndex('workspace_orderId_unique').on(
			cart.workspaceId,
			cart.orderId,
		),
	}),
);

export const Cart_Relations = relations(Carts, ({ one, many }) => ({
	// one-to-many
	workspace: one(Workspaces, {
		fields: [Carts.workspaceId],
		references: [Workspaces.id],
	}),
	funnel: one(CartFunnels, {
		fields: [Carts.cartFunnelId],
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
	fulfillments: many(CartFullfillments),
}));

/* Cart Fulfillment */
export const CartFullfillments = pgTable(
	'CartFullfillments',
	{
		...primaryId,
		...timestamps,
		cartId: dbId('cartId').references(() => Carts.id),

		shippingCarrier: varchar('shippingCarrier', { length: 255 }),
		shippingTrackingNumber: varchar('shippingTrackingNumber', { length: 255 }),
		fulfilledAt: timestamp('fulfilledAt'),
	},
	fulfillment => ({
		cart_fulfilledAt: uniqueIndex('cart_fulfilledAt_unique').on(
			fulfillment.cartId,
			fulfillment.fulfilledAt,
		),
	}),
);

export const CartFullfillment_Relations = relations(
	CartFullfillments,
	({ one, many }) => ({
		cart: one(Carts, {
			fields: [CartFullfillments.cartId],
			references: [Carts.id],
		}),
		products: many(CartFulfillmentProducts),
	}),
);

/* Cart Fulfillment Products */
export const CartFulfillmentProducts = pgTable(
	'CartFulfillmentProducts',
	{
		cartFulfillmentId: dbId('cartFulfillmentId').references(() => CartFullfillments.id),
		productId: dbId('productId').references(() => Products.id),
	},
	product => ({
		pk: primaryKey({
			name: 'CartFulfillmentProducts_pk',
			columns: [product.cartFulfillmentId, product.productId],
		}),
	}),
);

export const CartFulfillmentProduct_Relations = relations(
	CartFulfillmentProducts,
	({ one }) => ({
		cartFulfillment: one(CartFullfillments, {
			fields: [CartFulfillmentProducts.cartFulfillmentId],
			references: [CartFullfillments.id],
		}),
		product: one(Products, {
			fields: [CartFulfillmentProducts.productId],
			references: [Products.id],
		}),
	}),
);

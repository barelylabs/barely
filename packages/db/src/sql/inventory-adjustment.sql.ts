import { relations } from 'drizzle-orm';
import { integer, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

import { dbId, primaryId } from '../utils';
import { Products } from './product.sql';
import { Users } from './user.sql';

export const INVENTORY_POOLS = ['workspace', 'barely'] as const;

export const InventoryAdjustments = pgTable('InventoryAdjustments', {
	...primaryId,

	productId: dbId('productId')
		.notNull()
		.references(() => Products.id, { onDelete: 'cascade' }),

	apparelSize: varchar('apparelSize', {
		length: 25,
		enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
	}),

	pool: varchar('pool', { length: 25, enum: INVENTORY_POOLS }).notNull(),

	delta: integer('delta').notNull(),
	stockAfter: integer('stockAfter').notNull(),

	reason: varchar('reason', { length: 500 }).notNull(),

	adjustedBy: dbId('adjustedBy').references(() => Users.id, {
		onDelete: 'set null',
	}),

	createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const InventoryAdjustments_Relations = relations(
	InventoryAdjustments,
	({ one }) => ({
		product: one(Products, {
			fields: [InventoryAdjustments.productId],
			references: [Products.id],
		}),
		user: one(Users, {
			fields: [InventoryAdjustments.adjustedBy],
			references: [Users.id],
		}),
	}),
);

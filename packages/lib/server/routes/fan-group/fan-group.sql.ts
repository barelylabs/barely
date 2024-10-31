import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, text, varchar } from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../../../utils/sql';
import { CartFunnels } from '../cart-funnel/cart-funnel.sql';
import { Fans } from '../fan/fan.sql';
import { Products } from '../product/product.sql';
import { Workspaces } from '../workspace/workspace.sql';
import { FAN_GROUP_CONDITIONS } from './fan-group.constants';

export const FanGroups = pgTable('FanGroups', {
	...primaryId,
	...timestamps,

	workspaceId: dbId('workspaceId')
		.notNull()
		.references(() => Workspaces.id, {
			onUpdate: 'cascade',
			onDelete: 'cascade',
		}),

	name: varchar('name', { length: 255 }).notNull(),
	description: varchar('description', { length: 255 }),
});

export const FanGroup_Relations = relations(FanGroups, ({ one, many }) => ({
	workspace: one(Workspaces, {
		fields: [FanGroups.workspaceId],
		references: [Workspaces.id],
	}),
	fans: many(Fans),
	conditions: many(FanGroupConditions),
}));

/* Fans_To_Audiences */
export const Fans_To_FanGroups = pgTable('Fans_To_FanGroups', {
	fanId: dbId('fanId')
		.notNull()
		.references(() => Fans.id, {
			onUpdate: 'cascade',
			onDelete: 'cascade',
		}),

	fanGroupId: dbId('fanGroupId')
		.notNull()
		.references(() => FanGroups.id, {
			onUpdate: 'cascade',
			onDelete: 'cascade',
		}),
});

export const Fans_To_FanGroups_Relations = relations(Fans_To_FanGroups, ({ one }) => ({
	fan: one(Fans, {
		fields: [Fans_To_FanGroups.fanId],
		references: [Fans.id],
	}),
	fanGroup: one(FanGroups, {
		fields: [Fans_To_FanGroups.fanGroupId],
		references: [FanGroups.id],
	}),
}));

/* FanGroupConditions */
export const FanGroupConditions = pgTable('FanGroupConditions', {
	...primaryId,
	...timestamps,

	fanGroupId: dbId('fanGroupId')
		.notNull()
		.references(() => FanGroups.id, {
			onUpdate: 'cascade',
			onDelete: 'cascade',
		}),

	exclude: boolean('exclude').notNull().default(false),

	type: text('type', { enum: FAN_GROUP_CONDITIONS }).notNull(),

	// potential conditions:
	productId: dbId('productId').references(() => Products.id),
	cartFunnelId: dbId('cartFunnelId').references(() => CartFunnels.id),
	totalOrderAmount: integer('totalOrderAmount'), // in cents
});

export const FanGroupCondition_Relations = relations(FanGroupConditions, ({ one }) => ({
	fanGroup: one(FanGroups, {
		fields: [FanGroupConditions.fanGroupId],
		references: [FanGroups.id],
	}),
	product: one(Products, {
		fields: [FanGroupConditions.productId],
		references: [Products.id],
	}),
	cartFunnel: one(CartFunnels, {
		fields: [FanGroupConditions.cartFunnelId],
		references: [CartFunnels.id],
	}),
}));

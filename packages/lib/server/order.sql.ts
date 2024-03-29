// import { relations } from 'drizzle-orm';
// import { pgTable } from 'drizzle-orm/pg-core';

// import { dbId, primaryId, timestamps } from '../utils/sql';
// import { Carts } from './cart.sql';

// export const CartOrders = pgTable('CartOrders', {
// 	...primaryId,
// 	...timestamps,
// });

// export const CartOrders_Relations = relations(CartOrders, ({ one, many }) => ({
// 	carts: many(Carts),
// }));

// export const _CartOrders_To_Carts = pgTable('_CartOrders_To_Carts', {
// 	...primaryId,
// 	...timestamps,

// 	cartOrderId: dbId('cartOrderId').references(() => CartOrders.id),
// 	cartId: dbId('cartId').references(() => Carts.id),
// });

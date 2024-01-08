import { InferModel } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { TransactionLineItems } from './transaction-line-item.sql';

export const insertTransactionLineItemSchema = createInsertSchema(TransactionLineItems);
export const selectTransactionLineItemSchema = createSelectSchema(TransactionLineItems);

export type TransactionLineItem = InferModel<typeof TransactionLineItems, 'select'>;
export type InsertTransactionLineItem = InferModel<typeof TransactionLineItems, 'insert'>;

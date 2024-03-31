import type { InferInsertModel } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { TransactionLineItems } from './transaction-line-item.sql';

export const insertTransactionLineItemSchema = createInsertSchema(TransactionLineItems);
export const selectTransactionLineItemSchema = createSelectSchema(TransactionLineItems);

export type TransactionLineItem = InferInsertModel<typeof TransactionLineItems>;
export type InsertTransactionLineItem = InferInsertModel<typeof TransactionLineItems>;

import type { InferInsertModel } from 'drizzle-orm';
import { TransactionLineItems } from '@barely/db/sql';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const insertTransactionLineItemSchema = createInsertSchema(TransactionLineItems);
export const selectTransactionLineItemSchema = createSelectSchema(TransactionLineItems);

export type TransactionLineItem = InferInsertModel<typeof TransactionLineItems>;
export type InsertTransactionLineItem = InferInsertModel<typeof TransactionLineItems>;

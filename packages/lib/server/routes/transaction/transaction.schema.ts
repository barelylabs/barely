import type { InferInsertModel } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { Transactions } from './transaction.sql';

export const insertTransactionSchema = createInsertSchema(Transactions);
export const selectTransactionSchema = createSelectSchema(Transactions);

export type Transaction = InferInsertModel<typeof Transactions>;

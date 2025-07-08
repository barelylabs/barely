import type { InferInsertModel } from 'drizzle-orm';
import { Transactions } from '@barely/db/sql';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const insertTransactionSchema = createInsertSchema(Transactions);
export const selectTransactionSchema = createSelectSchema(Transactions);

export type Transaction = InferInsertModel<typeof Transactions>;

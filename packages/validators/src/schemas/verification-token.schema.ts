import type { InferInsertModel } from 'drizzle-orm';
import { VerificationTokens } from '@barely/db/sql';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const insertVerificationTokenSchema = createInsertSchema(VerificationTokens);
export const selectVerificationTokenSchema = createSelectSchema(VerificationTokens);

export type VerificationToken = InferInsertModel<typeof VerificationTokens>;

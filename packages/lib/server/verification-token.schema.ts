import type { InferInsertModel } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { VerificationTokens } from './verification-token.sql';

export const insertVerificationTokenSchema = createInsertSchema(VerificationTokens);
export const selectVerificationTokenSchema = createSelectSchema(VerificationTokens);

export type VerificationToken = InferInsertModel<typeof VerificationTokens>;

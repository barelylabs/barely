import type { InferModel } from 'drizzle-orm';
import { UserSessions } from '@barely/db/sql';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const insertUserSessionSchema = createInsertSchema(UserSessions);
export const selectUserSessionSchema = createSelectSchema(UserSessions);

export type UserSession = InferModel<typeof UserSessions>;

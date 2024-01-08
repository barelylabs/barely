import { InferModel } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { UserSessions } from './user-session.sql';

export const insertUserSessionSchema = createInsertSchema(UserSessions);
export const selectUserSessionSchema = createSelectSchema(UserSessions);

export type UserSession = InferModel<typeof UserSessions>;

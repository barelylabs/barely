import type { InferSelectModel } from 'drizzle-orm';
import type { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';

import { Emails } from './email.sql';

export const insertEmailSchema = createInsertSchema(Emails);
export const createEmailSchema = insertEmailSchema.omit({ id: true }).partial({
	workspaceId: true,
});
export const updateEmailSchema = insertEmailSchema.partial().required({
	id: true,
});

export type InsertEmail = z.infer<typeof insertEmailSchema>;
export type CreateEmail = z.infer<typeof createEmailSchema>;
export type UpdateEmail = z.infer<typeof updateEmailSchema>;
export type Email = InferSelectModel<typeof Emails>;

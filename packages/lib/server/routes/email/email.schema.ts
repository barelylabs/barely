import type { InferSelectModel } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

import { EmailTemplates } from './email.sql';

export const insertEmailSchema = createInsertSchema(EmailTemplates, {
	replyTo: z.preprocess(v => (v === '' ? undefined : v), z.string().email()).optional(),
});
export const createEmailSchema = insertEmailSchema.omit({ id: true }).partial({
	workspaceId: true,
});
export const updateEmailSchema = insertEmailSchema.partial().required({
	id: true,
});

export type InsertEmail = z.infer<typeof insertEmailSchema>;
export type CreateEmail = z.infer<typeof createEmailSchema>;
export type UpdateEmail = z.infer<typeof updateEmailSchema>;
export type Email = InferSelectModel<typeof EmailTemplates>;

export const sendTestEmailSchema = createEmailSchema.extend({
	to: z.string().email(),
	variables: z.object({
		firstName: z.string().optional().default('John'),
		lastName: z.string().optional().default('Doe'),
	}),
});

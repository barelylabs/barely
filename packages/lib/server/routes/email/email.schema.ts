import type { InferSelectModel } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

import { EmailTemplates } from './email.sql';

export const insertEmailTemplateSchema = createInsertSchema(EmailTemplates, {
	replyTo: z.preprocess(v => (v === '' ? undefined : v), z.string().email()).optional(),
});
export const createEmailTemplateSchema = insertEmailTemplateSchema
	.omit({ id: true })
	.partial({
		workspaceId: true,
	});
export const updateEmailTemplateSchema = insertEmailTemplateSchema.partial().required({
	id: true,
});

export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type CreateEmailTemplate = z.infer<typeof createEmailTemplateSchema>;
export type UpdateEmailTemplate = z.infer<typeof updateEmailTemplateSchema>;
export type EmailTemplate = InferSelectModel<typeof EmailTemplates>;

export const sendTestEmailSchema = createEmailTemplateSchema.extend({
	to: z.string().email(),
	variables: z.object({
		firstName: z.string().optional().default('John'),
		lastName: z.string().optional().default('Doe'),
	}),
});

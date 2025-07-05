import type { InferSelectModel } from 'drizzle-orm';
import { EmailDomains } from '@barely/db/sql';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod/v4';

import { querySelectionSchema } from '../helpers';

/* EMAIL DOMAIN */
export const insertEmailDomainSchema = createInsertSchema(EmailDomains);
export const createEmailDomainSchema = insertEmailDomainSchema
	.omit({ id: true, resendId: true })
	.partial({
		workspaceId: true,
	});
export const upsertEmailDomainSchema = insertEmailDomainSchema.partial({
	id: true,
	workspaceId: true,
	resendId: true,
});
export const updateEmailDomainSchema = insertEmailDomainSchema.partial().required({
	id: true,
});

export type InsertEmailDomain = z.infer<typeof insertEmailDomainSchema>;
export type CreateEmailDomain = z.infer<typeof createEmailDomainSchema>;
export type UpdateEmailDomain = z.infer<typeof updateEmailDomainSchema>;
export type EmailDomain = InferSelectModel<typeof EmailDomains>;

// forms
export const emailDomainFilterParamsSchema = z.object({
	search: z.string().optional(),
	showArchived: z.boolean().optional(),
});

export const emailDomainSearchParamsSchema = emailDomainFilterParamsSchema.extend({
	selectedEmailDomainIds: querySelectionSchema.optional(),
});

export const selectWorkspaceEmailDomainsSchema = emailDomainFilterParamsSchema.extend({
	// handle: z.string(),
	cursor: z.object({ id: z.string(), createdAt: z.coerce.date() }).optional(),
	limit: z.coerce.number().min(1).max(100).optional().default(20),
});

import type { InferSelectModel } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

import { queryStringArraySchema } from '../../../utils/zod-helpers';
import { EmailAddresses, EmailDomains } from './email-domain.sql';

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
	selectedEmailDomainIds: queryStringArraySchema.optional(),
});

export const selectWorkspaceEmailDomainsSchema = emailDomainFilterParamsSchema.extend({
	handle: z.string(),
	cursor: z.object({ id: z.string(), createdAt: z.string() }).optional(),
	limit: z.coerce.number().min(1).max(100).optional().default(20),
});

/* EMAIL ADDRESS */
export const insertEmailAddressSchema = createInsertSchema(EmailAddresses);
export const createEmailAddressSchema = insertEmailAddressSchema
	.omit({ id: true })
	.partial({
		workspaceId: true,
	});
export const updateEmailAddressSchema = insertEmailAddressSchema.partial().required({
	id: true,
});

export type InsertEmailAddress = z.infer<typeof insertEmailAddressSchema>;
export type CreateEmailAddress = z.infer<typeof createEmailAddressSchema>;
export type UpdateEmailAddress = z.infer<typeof updateEmailAddressSchema>;
export type EmailAddress = InferSelectModel<typeof EmailAddresses>;

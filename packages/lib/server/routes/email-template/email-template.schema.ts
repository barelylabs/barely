import type { InferSelectModel } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

import type { EmailAddress } from '../email-address/email-address.schema';
import type { EmailDomain } from '../email-domain/email-domain.schema';
import { queryBooleanSchema, querySelectionSchema } from '../../../utils/zod-helpers';
import { commonFiltersSchema, infiniteQuerySchema } from '../../common-filters';
import { EmailTemplates } from './email-template.sql';

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

export const upsertEmailTemplateSchema = insertEmailTemplateSchema.partial({
	id: true,
	workspaceId: true,
});

export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type CreateEmailTemplate = z.infer<typeof createEmailTemplateSchema>;
export type UpdateEmailTemplate = z.infer<typeof updateEmailTemplateSchema>;
export type EmailTemplate = InferSelectModel<typeof EmailTemplates>;
export type EmailTemplateWithFrom = EmailTemplate & {
	from: EmailAddress & { domain: EmailDomain };
};

// export const emailTemplateFilterParamsSchema = z.object({
// 	search: z.string().optional(),
// 	showArchived: z.boolean().optional(),
// 	showFlowOnly: z.boolean().optional(),
// 	showTypes: z.array(z.enum(['marketing', 'transactional'])).optional(),
// });

export const emailTemplateFilterParamsSchema = commonFiltersSchema.extend({
	showFlowOnly: queryBooleanSchema.optional(),
	showTypes: z.array(z.enum(['marketing', 'transactional'])).optional(),
	emailTemplateGroupId: z.string().optional(),
});

export const emailTemplateSearchParamsSchema = emailTemplateFilterParamsSchema.extend({
	selectedEmailTemplateIds: querySelectionSchema.optional(),
});

/* select workspace email templates */
export const selectWorkspaceEmailTemplatesSchema =
	emailTemplateFilterParamsSchema.merge(infiniteQuerySchema);

/* send test email */
export const sendTestEmailSchema = createEmailTemplateSchema.extend({
	to: z.string().email(),
	// toFanId: z.string(),
	variables: z.object({
		firstName: z.string().optional().default('John'),
		lastName: z.string().optional().default('Doe'),
	}),
});

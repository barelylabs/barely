import type { InferSelectModel } from 'drizzle-orm';
import { EmailTemplates } from '@barely/db/sql';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod/v4';

import type { EmailAddress } from './email-address.schema';
import type { EmailDomain } from './email-domain.schema';
import {
	commonFiltersSchema,
	infiniteQuerySchema,
	queryBooleanSchema,
	querySelectionSchema,
} from '../helpers';

export const insertEmailTemplateSchema = createInsertSchema(EmailTemplates, {
	replyTo: z
		.email()
		.transform(v => (v === '' ? undefined : v))
		.optional(),
	previewText: z
		.string()
		.max(90, 'Preview text should be 90 characters or less')
		.transform(v => (v === '' ? undefined : v))
		.optional(),
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
	to: z.email(),
	// toFanId: z.string(),
	variables: z.object({
		firstName: z.string().optional().default('John'),
		lastName: z.string().optional().default('Doe'),
	}),
	// .optional(),
});

export const emailTemplateForm_sendEmailSchema = createEmailTemplateSchema
	.partial({ workspaceId: true })
	.extend({
		sendTestEmailTo: z.email().optional(),
	});

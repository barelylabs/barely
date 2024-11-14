import type { InferSelectModel } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

import { commonFiltersSchema, infiniteQuerySchema } from '../../../utils/filters';
import { querySelectionSchema } from '../../../utils/zod-helpers';
import { insertEmailTemplateSchema } from '../email-template/email-template.schema';
import { EmailTemplateGroups } from '../email-template/email-template.sql';

export const insertEmailTemplateGroupSchema = createInsertSchema(EmailTemplateGroups);

//
const emailTemplateSchema = insertEmailTemplateSchema.pick({
	id: true,
	name: true,
	description: true,
});

export const createEmailTemplateGroupSchema = insertEmailTemplateGroupSchema
	.omit({ id: true })
	.partial({
		workspaceId: true,
	})
	.extend({
		emailTemplates: z.array(emailTemplateSchema),
	});

export const upsertEmailTemplateGroupSchema = insertEmailTemplateGroupSchema
	.partial({
		id: true,
		workspaceId: true,
	})
	.extend({ emailTemplates: z.array(emailTemplateSchema) });

export const updateEmailTemplateGroupSchema = insertEmailTemplateGroupSchema
	.partial()
	.required({
		id: true,
	})
	.extend({
		emailTemplates: z.array(emailTemplateSchema),
	});

export type InsertEmailTemplateGroup = z.infer<typeof insertEmailTemplateGroupSchema>;
export type CreateEmailTemplateGroup = z.infer<typeof createEmailTemplateGroupSchema>;
export type UpdateEmailTemplateGroup = z.infer<typeof updateEmailTemplateGroupSchema>;
export type EmailTemplateGroup = InferSelectModel<typeof EmailTemplateGroups>;

export const emailTemplateGroupFilterParamsSchema = commonFiltersSchema;

export const emailTemplateGroupSearchParamsSchema =
	emailTemplateGroupFilterParamsSchema.extend({
		selectedEmailTemplateGroupIds: querySelectionSchema.optional(),
	});

/* select workspace email template groups */
export const selectWorkspaceEmailTemplateGroupsSchema =
	emailTemplateGroupFilterParamsSchema.merge(infiniteQuerySchema);

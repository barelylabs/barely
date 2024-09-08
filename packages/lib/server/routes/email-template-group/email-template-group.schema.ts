import type { InferSelectModel } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

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
// .extend({
// 	lexorank: z.string(),
// });

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

export const emailTemplateGroupFilterParamsSchema = z.object({
	search: z.string().optional(),
	showArchived: z.boolean().optional(),
});

export const emailTemplateGroupSearchParamsSchema =
	emailTemplateGroupFilterParamsSchema.extend({
		selectedEmailTemplateGroupIds: querySelectionSchema.optional(),
	});

/* select workspace email template groups */
export const selectWorkspaceEmailTemplateGroupsSchema =
	emailTemplateGroupFilterParamsSchema.extend({
		handle: z.string(),
		limit: z.number().min(1).max(100).default(50),
		cursor: z
			.object({
				id: z.string(),
				createdAt: z.date(),
			})
			.optional(),
	});

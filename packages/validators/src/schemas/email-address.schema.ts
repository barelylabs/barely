import type { InferSelectModel } from 'drizzle-orm';
import { EmailAddresses } from '@barely/db/sql';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod/v4';

import { querySelectionSchema } from '../helpers';

export const insertEmailAddressSchema = createInsertSchema(EmailAddresses, {
	username: z.string().min(1),
});
export const createEmailAddressSchema = insertEmailAddressSchema
	.omit({ id: true })
	.partial({
		workspaceId: true,
	});
export const updateEmailAddressSchema = insertEmailAddressSchema.partial().required({
	id: true,
	username: true,
	default: true,
});

export type InsertEmailAddress = z.infer<typeof insertEmailAddressSchema>;
export type CreateEmailAddress = z.infer<typeof createEmailAddressSchema>;
export type UpdateEmailAddress = z.infer<typeof updateEmailAddressSchema>;
export type EmailAddress = InferSelectModel<typeof EmailAddresses>;

// forms
export const emailAddressFilterParamsSchema = z.object({
	search: z.string().optional(),
	showArchived: z.boolean().optional(),
});

export const emailAddressSearchParamsSchema = emailAddressFilterParamsSchema.extend({
	selectedEmailAddressIds: querySelectionSchema.optional(),
});

export const selectWorkspaceEmailAddressesSchema = emailAddressFilterParamsSchema.extend({
	handle: z.string(),
	cursor: z.object({ id: z.string(), createdAt: z.coerce.date() }).optional(),
	limit: z.coerce.number().min(1).max(100).optional().default(20),
});

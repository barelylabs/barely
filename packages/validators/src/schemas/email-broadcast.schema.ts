/* select workspace email broadcasts */
import type { InferSelectModel } from 'drizzle-orm';
import { EmailBroadcasts } from '@barely/db/sql';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod/v4';

import {
	commonFiltersSchema,
	infiniteQuerySchema,
	querySelectionSchema,
	queryStringEnumArraySchema,
} from '../helpers';

export const insertEmailBroadcastSchema = createInsertSchema(EmailBroadcasts);
export const createEmailBroadcastSchema = insertEmailBroadcastSchema.omit({
	id: true,
	workspaceId: true,
});
export const updateEmailBroadcastSchema = insertEmailBroadcastSchema.partial().required({
	id: true,
});
export const upsertEmailBroadcastSchema = insertEmailBroadcastSchema.partial({
	id: true,
	workspaceId: true,
});

export type InsertEmailBroadcast = z.infer<typeof insertEmailBroadcastSchema>;
export type UpdateEmailBroadcast = z.infer<typeof updateEmailBroadcastSchema>;
export type UpsertEmailBroadcast = z.infer<typeof upsertEmailBroadcastSchema>;
export type EmailBroadcast = InferSelectModel<typeof EmailBroadcasts>;

export const sendEmailBroadcastSchema = z.object({
	emailTemplateId: z.string(),
	fanGroupId: z.string(),
	scheduledAt: z.date().optional(),
});

export const emailBroadcastFilterParamsSchema = commonFiltersSchema.extend({
	showStatuses: queryStringEnumArraySchema([
		'draft',
		'scheduled',
		'sending',
		'sent',
		'failed',
	]).optional(),
});

export const emailBroadcastSearchParamsSchema = emailBroadcastFilterParamsSchema.extend({
	selectedEmailBroadcastIds: querySelectionSchema.optional(),
});

export const selectWorkspaceEmailBroadcastsSchema =
	emailBroadcastSearchParamsSchema.merge(infiniteQuerySchema);

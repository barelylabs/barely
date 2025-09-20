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
	] as const).optional(),
});

export const emailBroadcastSearchParamsSchema = emailBroadcastFilterParamsSchema.extend({
	selectedEmailBroadcastIds: querySelectionSchema.optional(),
});

export const selectWorkspaceEmailBroadcastsSchema =
	emailBroadcastSearchParamsSchema.extend(infiniteQuerySchema.shape);

// Create broadcast with inline template creation
export const createEmailBroadcastWithTemplateSchema = z.object({
	// Template fields
	name: z.string(),
	fromId: z.string(),
	subject: z.string(),
	previewText: z.string().optional(),
	body: z.string(),
	type: z.enum(['marketing', 'transactional']).default('marketing'),
	replyTo: z.email().optional(),

	// Broadcast fields
	fanGroupId: z.string().nullable(),
	status: z.enum(['draft', 'scheduled']).default('draft'),
	scheduledAt: z.date().nullable(),

	// Options
	broadcastOnly: z.boolean().default(false), // If true, template won't show in templates list
});

// Duplicate broadcast
export const duplicateEmailBroadcastSchema = z.object({
	id: z.string(),
});

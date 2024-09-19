import type { InferSelectModel } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

import { querySelectionSchema } from '../../../utils/zod-helpers';
import { Fans } from './fan.sql';

export const insertFanSchema = createInsertSchema(Fans);
export const createFanSchema = insertFanSchema.omit({ id: true, workspaceId: true });
export const updateFanSchema = insertFanSchema.partial().required({ id: true });
export const upsertFanSchema = insertFanSchema.partial({
	id: true,
	workspaceId: true,
});

export type InsertFan = z.input<typeof insertFanSchema>;
export type CreateFan = z.input<typeof createFanSchema>;
export type UpsertFan = z.input<typeof upsertFanSchema>;
export type UpdateFan = z.input<typeof updateFanSchema>;
export type Fan = InferSelectModel<typeof Fans>;

// forms
export const fanFilterParamsSchema = z.object({
	search: z.string().optional(),
	showArchived: z.boolean().optional(),
});
export const fanSearchParamsSchema = fanFilterParamsSchema.extend({
	selectedFanIds: querySelectionSchema.optional(),
});

export const selectWorkspaceFansSchema = fanFilterParamsSchema.extend({
	// handle: z.string(),
	cursor: z.object({ id: z.string(), createdAt: z.coerce.date() }).optional(),
	limit: z.coerce.number().min(1).max(100).optional().default(20),
});

export const defaultFan: CreateFan = {
	fullName: '',
	email: '',
};

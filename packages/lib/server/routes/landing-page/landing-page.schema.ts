import type { InferSelectModel } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

import { querySelectionSchema } from '../../../utils/zod-helpers';
import { LandingPages } from './landing-page.sql';

export const insertLandingPageSchema = createInsertSchema(LandingPages, {
	name: s => s.name.min(1, 'Name is required'),
	key: s => s.key.min(4, 'Key is required'),

	content: s => s.content.min(1, 'Content is required'),
});
export const createLandingPageSchema = insertLandingPageSchema.omit({
	id: true,
	workspaceId: true,
	handle: true,
});
export const upsertLandingPageSchema = insertLandingPageSchema.partial({
	id: true,
	workspaceId: true,
	handle: true,
});
export const updateLandingPageSchema = insertLandingPageSchema
	.partial()
	.required({ id: true });

export type InsertLandingPage = z.infer<typeof insertLandingPageSchema>;
export type CreateLandingPage = z.infer<typeof createLandingPageSchema>;
export type UpsertLandingPage = z.infer<typeof upsertLandingPageSchema>;
export type UpdateLandingPage = z.infer<typeof updateLandingPageSchema>;
export type LandingPage = InferSelectModel<typeof LandingPages>;

// forms
export const landingPageFilterParamsSchema = z.object({
	search: z.string().optional(),
	showArchived: z.boolean().optional(),
});
export const landingPageSearchParamsSchema = landingPageFilterParamsSchema.extend({
	selectedLandingPageIds: querySelectionSchema.optional(),
});

export const selectWorkspaceLandingPagesSchema = landingPageFilterParamsSchema.extend({
	handle: z.string(),
	cursor: z.object({ id: z.string(), createdAt: z.coerce.date() }).optional(),
	limit: z.coerce.number().min(1).max(100).optional().default(20),
});

export const defaultLandingPage: CreateLandingPage = {
	name: '',
	key: '',
	content: '',
};

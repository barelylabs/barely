import type { InferSelectModel } from 'drizzle-orm';
import type { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';

import { querySelectionSchema } from '../../../utils/zod-helpers';
import { commonFiltersSchema, infiniteQuerySchema } from '../../common-filters';
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
export const landingPageFilterParamsSchema = commonFiltersSchema;
export const landingPageSearchParamsSchema = landingPageFilterParamsSchema.extend({
	selectedLandingPageIds: querySelectionSchema.optional(),
});

export const selectWorkspaceLandingPagesSchema =
	commonFiltersSchema.merge(infiniteQuerySchema);

export const defaultLandingPage: CreateLandingPage = {
	name: '',
	key: '',
	content: '',
};

import type { InferSelectModel } from 'drizzle-orm';
import type { z } from 'zod/v4';
import { LandingPages } from '@barely/db/sql';
import { createInsertSchema } from 'drizzle-zod';

import {
	commonFiltersSchema,
	infiniteQuerySchema,
	pageFiltersSchema,
	querySelectionSchema,
} from '../helpers';
import { stdWebEventPipeQueryParamsSchema } from './tb.schema';

export const insertLandingPageSchema = createInsertSchema(LandingPages, {
	name: name => name.min(1, 'Name is required'),
	key: key => key.min(4, 'Key is required'),

	content: content => content.min(1, 'Content is required'),
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
	selectedIds: querySelectionSchema.optional(),
});

export const selectWorkspaceLandingPagesSchema = commonFiltersSchema.extend(
	infiniteQuerySchema.shape,
);

export const defaultLandingPage: CreateLandingPage = {
	name: '',
	key: '',
	content: '',
};

// stat filters
export const landingPageStatFiltersSchema = stdWebEventPipeQueryParamsSchema.extend(
	pageFiltersSchema.shape,
);

export type LandingPageStatFilters = z.infer<typeof landingPageStatFiltersSchema>;

import type { InferSelectModel } from 'drizzle-orm';
import { FmLinks, FmPages } from '@barely/db/sql';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod/v4';

import {
	commonFiltersSchema,
	infiniteQuerySchema,
	platformFiltersSchema,
	// platformFiltersSchema,
	querySelectionSchema,
} from '../helpers';
import { stdWebEventPipeQueryParamsSchema } from './tb.schema';

// FmLinks
export const insertFmLinkSchema = createInsertSchema(FmLinks);
export const createFmLinkSchema = insertFmLinkSchema
	.omit({
		id: true,
	})
	.partial({
		index: true,
		fmPageId: true,
	});
export const upsertFmLinkSchema = insertFmLinkSchema.partial({
	id: true,
	index: true,
	fmPageId: true,
});

export type InsertFmLink = z.infer<typeof insertFmLinkSchema>;
export type CreateFmLink = z.infer<typeof createFmLinkSchema>;
export type UpsertFmLink = z.infer<typeof upsertFmLinkSchema>;
export type FmLink = InferSelectModel<typeof FmLinks>;

export const insertFmPageSchema = createInsertSchema(FmPages, {
	key: key => key.min(4, 'Key is required'),
	title: title => title.min(1, 'Title is required'),
	sourceUrl: sourceUrl => sourceUrl.min(1, 'Source URL is required'),
}).extend({
	coverArtUrl: z.string().optional(),
});

export const createFmPageSchema = insertFmPageSchema
	.omit({
		id: true,
		workspaceId: true,
		handle: true,
	})
	.extend({
		links: z.array(createFmLinkSchema),
	});

export const upsertFmPageSchema = insertFmPageSchema
	.partial({
		id: true,
		workspaceId: true,
		handle: true,
	})
	.extend({
		links: z.array(upsertFmLinkSchema),
	});

export const updateFmPageSchema = insertFmPageSchema
	.partial()
	.required({ id: true })
	.extend({
		links: z.array(upsertFmLinkSchema).optional(),
	});

export type InsertFmPage = z.infer<typeof insertFmPageSchema>;
export type CreateFmPage = z.infer<typeof createFmPageSchema>;
export type UpsertFmPage = z.infer<typeof upsertFmPageSchema>;
export type UpdateFmPage = z.infer<typeof updateFmPageSchema>;
export type FmPage = InferSelectModel<typeof FmPages>;

export interface FmPageWith_Links extends FmPage {
	links: FmLink[];
}

// forms
export const fmFilterParamsSchema = commonFiltersSchema;

export const fmSearchParamsSchema = fmFilterParamsSchema.extend({
	selectedFmPageIds: querySelectionSchema.optional(),
});

export const selectWorkspaceFmPagesSchema = fmFilterParamsSchema.extend(
	infiniteQuerySchema.shape,
);

export const defaultFmPage: CreateFmPage = {
	key: '',
	title: '',
	sourceUrl: '',
	scheme: 'light',
	showSocial: false,
	remarketing: false,
	links: [],
};

// stat filters
export const fmStatFiltersSchema = stdWebEventPipeQueryParamsSchema.extend(
	platformFiltersSchema.shape,
);

export type FmStatFilters = z.infer<typeof fmStatFiltersSchema>;

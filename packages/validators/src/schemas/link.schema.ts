import { Links } from '@barely/db/sql';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod/v4';

import type { AnalyticsEndpoint } from './analytics-endpoint.schema';
// import type { AnalyticsEndpoint } from './analytics-endpoint-schema';
import type { Workspace } from './workspace.schema';
import {
	commonFiltersSchema,
	infiniteQuerySchema,
	isValidUrl,
	querySelectionSchema,
} from '../helpers';
import { stdWebEventPipeQueryParamsSchema } from './tb.schema';

export const insertLinkSchema = createInsertSchema(Links, {
	url: url =>
		url.refine(v => isValidUrl(v), {
			message: 'Please enter a valid URL.',
		}),
	key: key => key.min(1, 'Your key must be at least 1 character long'),
});
export const createLinkSchema = insertLinkSchema.omit({ id: true }).partial({
	userId: true,
	workspaceId: true,
	handle: true,
});
export const updateLinkSchema = insertLinkSchema.partial().required({ id: true });
export const upsertLinkSchema = insertLinkSchema.partial({
	id: true,
	workspaceId: true,
	userId: true,
	handle: true,
});
export const selectLinkSchema = createSelectSchema(Links);

export type InsertLink = z.infer<typeof insertLinkSchema>;
export type CreateLink = z.infer<typeof createLinkSchema>;
export type UpdateLink = z.infer<typeof updateLinkSchema>;
export type UpsertLink = z.infer<typeof upsertLinkSchema>;
export type Link = z.infer<typeof selectLinkSchema>;

export type LinkMetaTags = Pick<Link, 'title' | 'description' | 'image' | 'favicon'>;

export interface LinkWithAnalyticsEndpoints extends Link {
	analyticsEndpoints: AnalyticsEndpoint[];
}

// forms
export const linkFilterParamsSchema = commonFiltersSchema.extend({
	userId: z.string().optional(),
});

export const linkSearchParamsSchema = linkFilterParamsSchema.extend({
	selectedLinkIds: querySelectionSchema.optional(),
});

export const selectWorkspaceLinksSchema = linkFilterParamsSchema.extend(
	infiniteQuerySchema.shape,
);

export const defaultLink: CreateLink = {
	transparent: false,
	//short
	domain: '', // this should be handled on the client
	key: '',
	// destination
	url: '',
	appleScheme: '',
	androidScheme: '',
	// meta tags
	customMetaTags: false,
	title: '',
	description: '',
	image: '',
};
// analytics
export const linkRoutingSchema = insertLinkSchema.pick({
	url: true,
	appleScheme: true,
	androidScheme: true,
	externalAppLinkUrl: true,
});

export type LinkRoutingProps = z.infer<typeof linkRoutingSchema>;

export const linkEventSchema = z.object({
	id: z.string(),
	workspaceId: z.string(),
	domain: z.string().optional(),
	key: z.string().optional(),
	remarketing: z.boolean(),
	customMetaTags: z.boolean().nullable(),
});

export type LinkEventProps = z.infer<typeof linkEventSchema>;

export const linkAnalyticsSchema = linkRoutingSchema.extend(linkEventSchema.shape);

export type LinkAnalyticsProps = z.infer<typeof linkAnalyticsSchema> & {
	workspace: {
		id: string;
		plan: Workspace['plan'];
		eventUsage: number;
		eventUsageLimitOverride: number | null;
	};
};

// stat filters
export const linkStatFiltersSchema = stdWebEventPipeQueryParamsSchema;

export type LinkStatFilters = z.infer<typeof linkStatFiltersSchema>;

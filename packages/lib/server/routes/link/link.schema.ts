import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import type { AnalyticsEndpoint } from '../analytics-endpoint/analytics-endpoint-schema';
import { isValidUrl } from '../../../utils/link';
import { queryStringArraySchema, z_boolean } from '../../../utils/zod-helpers';
import { Links } from './link.sql';

export const insertLinkSchema = createInsertSchema(Links, {
	url: schema =>
		schema.url.refine(v => isValidUrl(v), {
			message: 'Please enter a valid URL.',
		}),
	key: schema => schema.key.min(1, 'Your key must be at least 1 character long'),
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
export const linkFilterParamsSchema = z.object({
	search: z.string().optional(),
	userId: z.string().optional(),
	showArchived: z_boolean.optional(),
});

export const linkSearchParamsSchema = linkFilterParamsSchema.extend({
	selectedLinkIds: queryStringArraySchema.optional(),
});

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

export const linkAnalyticsSchema = linkRoutingSchema.merge(linkEventSchema);

export type LinkAnalyticsProps = z.infer<typeof linkAnalyticsSchema>;

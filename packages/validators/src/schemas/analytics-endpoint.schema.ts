import { AnalyticsEndpoints } from '@barely/db/sql';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod/v4';

export const insertAnalyticsEndpointSchema = createInsertSchema(AnalyticsEndpoints);
export const createAnalyticsEndpointSchema = insertAnalyticsEndpointSchema.omit({
	id: true,
});
export const updateAnalyticsEndpointSchema = insertAnalyticsEndpointSchema
	.partial()
	.required({ id: true });
export const upsertAnalyticsEndpointSchema = insertAnalyticsEndpointSchema.partial({
	id: true,
});
export const selectAnalyticsEndpointSchema = createSelectSchema(AnalyticsEndpoints);

export type AnalyticsEndpoint = z.infer<typeof selectAnalyticsEndpointSchema>;
export type CreateAnalyticsEndpoint = z.infer<typeof createAnalyticsEndpointSchema>;
export type UpdateAnalyticsEndpoint = z.infer<typeof updateAnalyticsEndpointSchema>;
export type UpsertAnalyticsEndpoint = z.infer<typeof upsertAnalyticsEndpointSchema>;
export type SelectAnalyticsEndpoint = z.infer<typeof selectAnalyticsEndpointSchema>;

// forms
export const workspaceAnalyticsEndpointsFormSchema = z.object({
	meta: insertAnalyticsEndpointSchema,
	google: insertAnalyticsEndpointSchema,
	tiktok: insertAnalyticsEndpointSchema,
	snapchat: insertAnalyticsEndpointSchema,
});

export const insertMetaPixelSchema = createInsertSchema(AnalyticsEndpoints, {
	id: id =>
		id
			.min(15, {
				message: 'Your meta pixel id should be 15-16 characters long',
			})
			.max(16, {
				message: 'Your meta pixel id should be 15-16 characters long',
			}),
	platform: platform => platform.refine(p => p === 'meta', 'Invalid platform'),
	accessToken: accessToken =>
		accessToken.min(150, {
			message: 'Your access token should be at least 150 characters',
		}),
});

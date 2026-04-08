import type { InferSelectModel } from 'drizzle-orm';
import { SpotifyPreSaves } from '@barely/db/sql';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod/v4';

import { commonFiltersSchema, infiniteQuerySchema } from '../helpers';

// base schemas
export const insertSpotifyPreSaveSchema = createInsertSchema(SpotifyPreSaves);
export const createSpotifyPreSaveSchema = insertSpotifyPreSaveSchema.omit({
	id: true,
});
export const updateSpotifyPreSaveSchema = insertSpotifyPreSaveSchema
	.partial()
	.required({ id: true });

// types
export type SpotifyPreSave = InferSelectModel<typeof SpotifyPreSaves>;
export type InsertSpotifyPreSave = z.infer<typeof insertSpotifyPreSaveSchema>;
export type CreateSpotifyPreSave = z.infer<typeof createSpotifyPreSaveSchema>;

// fan-facing pre-save request (from FM page after OAuth callback)
export const spotifyPreSaveRequestSchema = z.object({
	fmPageId: z.string(),
	code: z.string(), // Spotify authorization code
	email: z.string().optional(),
	fullName: z.string().optional(),
	emailMarketingOptIn: z.boolean().default(false),
	timezone: z.string().optional(),
});

export type SpotifyPreSaveRequest = z.infer<typeof spotifyPreSaveRequestSchema>;

// admin: query pre-saves for a track
export const spotifyPreSaveFilterParamsSchema = commonFiltersSchema.extend({
	trackId: z.string().optional(),
	fmPageId: z.string().optional(),
	fulfilled: z.boolean().optional(),
});

export const selectWorkspacePreSavesSchema = spotifyPreSaveFilterParamsSchema.extend(
	infiniteQuerySchema.shape,
);

// admin: manually trigger pre-save fulfillment
export const fulfillPreSavesSchema = z.object({
	trackId: z.string(),
});

export type FulfillPreSavesInput = z.infer<typeof fulfillPreSavesSchema>;

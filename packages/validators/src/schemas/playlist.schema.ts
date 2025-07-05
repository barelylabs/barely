import type { InferInsertModel } from 'drizzle-orm';
import type { z } from 'zod/v4';
import { Playlists } from '@barely/db/sql';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import {
	commonFiltersSchema,
	infiniteQuerySchema,
	querySelectionSchema,
} from '../helpers';

export const insertPlaylistSchema = createInsertSchema(Playlists);
export const createPlaylistSchema = insertPlaylistSchema.omit({
	id: true,
	workspaceId: true,
});
export const updatePlaylistSchema = insertPlaylistSchema.partial().required({ id: true });
export const upsertPlaylistSchema = insertPlaylistSchema.partial({
	id: true,
	workspaceId: true,
});
export const selectPlaylistSchema = createSelectSchema(Playlists);

export type Playlist = InferInsertModel<typeof Playlists>;
export type CreatePlaylist = z.infer<typeof createPlaylistSchema>;
export type UpdatePlaylist = z.infer<typeof updatePlaylistSchema>;
export type UpsertPlaylist = z.infer<typeof upsertPlaylistSchema>;
export type SelectPlaylist = z.infer<typeof selectPlaylistSchema>;

// forms
export const playlistFilterParamsSchema = commonFiltersSchema;

export const playlistSearchParamsSchema = playlistFilterParamsSchema.extend({
	selectedPlaylistIds: querySelectionSchema.optional(),
});

export const selectWorkspacePlaylistsSchema =
	playlistSearchParamsSchema.merge(infiniteQuerySchema);

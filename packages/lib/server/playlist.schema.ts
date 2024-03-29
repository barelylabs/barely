import type { InferInsertModel } from 'drizzle-orm';
import type { z } from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { Playlists } from './playlist.sql';

export const insertPlaylistSchema = createInsertSchema(Playlists);
export const createPlaylistSchema = insertPlaylistSchema.omit({ id: true });
export const updatePlaylistSchema = insertPlaylistSchema.partial().required({ id: true });
export const upsertPlaylistSchema = insertPlaylistSchema.partial({ id: true });
export const selectPlaylistSchema = createSelectSchema(Playlists);

export type Playlist = InferInsertModel<typeof Playlists>;
export type CreatePlaylist = z.infer<typeof createPlaylistSchema>;
export type UpdatePlaylist = z.infer<typeof updatePlaylistSchema>;
export type UpsertPlaylist = z.infer<typeof upsertPlaylistSchema>;
export type SelectPlaylist = z.infer<typeof selectPlaylistSchema>;

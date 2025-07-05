import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { genreIds } from '@barely/db/schema';
import { _Playlists_To_Genres, _Tracks_To_Genres, Genres } from '@barely/db/sql';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod/v4';

export const genreIdSchema = z.enum(genreIds);

export const insertGenreSchema = createInsertSchema(Genres, {
	id: genreIdSchema,
});

export type Genre = InferSelectModel<typeof Genres>;
export type CreateGenre = z.infer<typeof insertGenreSchema>;
export type UpdateGenre = z.infer<typeof insertGenreSchema>;
export type UpsertGenre = z.infer<typeof insertGenreSchema>;
export type SelectGenre = z.infer<typeof insertGenreSchema>;

// track genres (join)
export const insertTrackGenreSchema = createInsertSchema(_Tracks_To_Genres, {
	genreId: genreIdSchema,
});
export const selectTrackGenreSchema = createSelectSchema(_Tracks_To_Genres, {
	genreId: genreIdSchema,
});

export type TrackGenre = z.infer<typeof insertTrackGenreSchema>;
export type SelectTrackGenre = z.infer<typeof selectTrackGenreSchema>;

// playlist genres (join)

export const insertPlaylistGenreSchema = createInsertSchema(_Playlists_To_Genres, {
	genreId: genreIdSchema,
});
export const selectPlaylistGenreSchema = createSelectSchema(_Playlists_To_Genres, {
	genreId: genreIdSchema,
});

export type GenreWithPlaylistStats = Genre & {
	totalPlaylists: number;
	totalPitchReviewers: number;
};

export type PlaylistGenre = InferInsertModel<typeof _Playlists_To_Genres>;
export type SelectPlaylistGenre = z.infer<typeof selectPlaylistGenreSchema>;

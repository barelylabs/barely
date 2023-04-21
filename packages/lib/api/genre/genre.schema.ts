import { z } from 'zod';

const genreOptionSchema = z.object({
	name: z.string(),
	_count: z
		.object({
			playlistGenres: z.number().optional(),
			trackGenres: z.number().optional(),
		})
		.optional(),
});

const trackGenreSchema = z.object({
	genreName: z.string(),
	trackId: z.string(),
});

const playlistGenreSchema = z.object({
	genreName: z.string(),
	playlistId: z.string(),
});

type GenreOption = z.infer<typeof genreOptionSchema>;

export { genreOptionSchema, trackGenreSchema, playlistGenreSchema, type GenreOption };

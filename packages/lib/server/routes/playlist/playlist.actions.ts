'use server';

import type { GenreId } from '../genre/genre.schema';
import { totalPlaylistReachByGenres } from './playlist.fns';

export async function getTotalPlaylistReachByGenres_SA(genreIds: GenreId[]) {
	return totalPlaylistReachByGenres(genreIds);
}

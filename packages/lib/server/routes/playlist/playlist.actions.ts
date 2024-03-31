'use server';

import type { GenreId } from '../genre/genre.schema';
import { db } from '../../db';
import { totalPlaylistReachByGenres } from './playlist.fns';

export async function getTotalPlaylistReachByGenres_SA(genreIds: GenreId[]) {
	return totalPlaylistReachByGenres(genreIds, db);
}

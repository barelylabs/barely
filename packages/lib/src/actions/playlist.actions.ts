'use server';

import type { GenreId } from '@barely/db/schema';

// import type { GenreId } from '@barely/validators/schemas';
import { totalPlaylistReachByGenres } from '../functions/playlist.fns';

export async function getTotalPlaylistReachByGenres_SA(genreIds: GenreId[]) {
	return totalPlaylistReachByGenres(genreIds);
}

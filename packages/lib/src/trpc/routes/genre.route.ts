import type { GenreWithPlaylistStats } from '@barely/validators';
import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { _Playlists_To_Genres } from '@barely/db/sql/genre.sql';

import { getGenresByUserId } from '../../functions/genre.fns';
import { privateProcedure, publicProcedure } from '../trpc';

export const genreRoute = {
	allInPitchPlaylists: publicProcedure.query(async () => {
		const allGenres = await dbHttp.query.Genres.findMany({
			with: {
				_playlists: {
					columns: {},
					with: {
						playlist: {
							columns: {},
							with: {
								_providerAccounts: {
									columns: {},
									with: {
										providerAccount: {
											columns: {},
											with: {
												user: {
													columns: {
														id: true,
														pitchReviewing: true,
													},
												},
											},
										},
									},
								},
							},
						},
					},
				},
			},
		});

		const genres = allGenres.filter(genre => {
			return genre._playlists.some(playlist => {
				return playlist.playlist._providerAccounts.some(providerAccount => {
					return providerAccount.providerAccount.user.pitchReviewing === true;
				});
			});
		});

		return genres.map(g => {
			const totalPlaylists = g._playlists.length;

			// create a map of pitch reviewers
			const pitchReviewers = new Map();
			g._playlists.forEach(playlist => {
				playlist.playlist._providerAccounts.forEach(providerAccount => {
					if (providerAccount.providerAccount.user.pitchReviewing === true) {
						pitchReviewers.set(providerAccount.providerAccount.user.id, true);
					}
				});
			});
			const totalPitchReviewers = pitchReviewers.size;

			const genreWithPlaylistStats: GenreWithPlaylistStats = {
				id: g.id,
				name: g.name,
				parent: g.parent,
				subgenre: g.subgenre,
				totalPlaylists,
				totalPitchReviewers,
			};

			return genreWithPlaylistStats;
		});
	}),

	allByCurrentUser: privateProcedure.query(async ({ ctx }) => {
		if (!ctx.user.id) return [];
		return await getGenresByUserId(ctx.user.id, ctx.pool);
	}),
} satisfies TRPCRouterRecord;

import type { inferAsyncReturnType } from '@trpc/server';
import { TRPCError } from '@trpc/server';
import { eq, inArray } from 'drizzle-orm';

import type { Db } from '../../db';
import type { Genre } from '../genre/genre.schema';
import type { ProviderAccount } from '../provider-account/provider-account.schema';
import type { Playlist } from './playlist.schema';
import { dbHttp } from '../../db';
import { getSpotifyPlaylistTracks } from '../../spotify/spotify.endpts.playlist';
import { estimateGenresByTracks } from '../genre/genre.gpt';
import { _Playlists_To_Genres, Genres } from '../genre/genre.sql';
import { getSpotifyAccessToken } from '../spotify/spotify.fns';

export interface PlaylistWithProviderAccounts extends Playlist {
	providerAccounts: ProviderAccount[];
	genres: Genre[];
}

const getPlaylistById = async (playlistId: string, db: Db) => {
	const playlist = await db.http.query.Playlists.findFirst({
		where: Playlists => eq(Playlists.id, playlistId),
		with: {
			_genres: {
				with: {
					genre: true,
				},
			},
			_providerAccounts: {
				with: {
					providerAccount: true,
				},
			},
		},
	});

	if (!playlist) {
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: 'Playlist not found',
		});
	}

	const playlistWithProviderAccounts: PlaylistWithProviderAccounts = {
		...playlist,
		tracklist: undefined, // fixme
		providerAccounts: playlist._providerAccounts.map(_pa => _pa.providerAccount),
		genres: playlist._genres.map(_g => _g.genre),
	};

	return playlistWithProviderAccounts;
};

const getPlaylistsByUserId = async (userId: string, db: Db) => {
	// fixme: this can be done more efficiently if/when drizzle introduces nested relational queries:
	// https://github.com/drizzle-team/drizzle-orm/issues/696

	// console.log('getting userWithPlaylists for ', userId);

	const userWithPlaylists = await db.http.query.Users.findFirst({
		where: users => eq(users.id, userId),
		columns: {},
		with: {
			_workspaces: {
				columns: {},
				with: {
					workspace: {
						columns: {},
						with: {
							playlists: {
								with: {
									workspace: true,
									_genres: {
										with: {
											genre: true,
										},
									},
									_providerAccounts: {
										columns: {},
										with: {
											providerAccount: true,
										},
									},
								},
							},
						},
					},
				},
			},
			providerAccounts: {
				columns: { providerAccountId: true },
				with: {
					_playlists: {
						columns: {},
						with: {
							playlist: {
								with: {
									_genres: {
										with: {
											genre: true,
										},
									},
									_providerAccounts: {
										columns: {},
										with: {
											providerAccount: true,
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

	// console.log('userWithPlaylists => ', userWithPlaylists);

	const playlists = new Map<string, PlaylistWithProviderAccounts>();

	userWithPlaylists?._workspaces.forEach(_w => {
		_w.workspace.playlists.forEach(playlist => {
			playlists.set(playlist.id, {
				...playlist,
				tracklist: undefined,
				providerAccounts: playlist._providerAccounts.map(_pa => _pa.providerAccount),
				genres: playlist._genres.map(_g => _g.genre),
			});
		});
	});

	userWithPlaylists?.providerAccounts.forEach(providerAccount => {
		providerAccount._playlists.forEach(_playlist => {
			_playlist.playlist &&
				playlists.set(_playlist.playlist.id, {
					..._playlist.playlist,
					tracklist: undefined,
					providerAccounts: _playlist.playlist._providerAccounts.map(
						_pa => _pa.providerAccount,
					),
					genres: _playlist.playlist._genres.map(_g => _g.genre),
				});
		});
	});

	return playlists;
};

const userGetPlaylistById = async (userId: string, playlistId: string, db: Db) => {
	console.log('userId => ', userId);
	console.log('playlistId => ', playlistId);

	const userPlaylists = await getPlaylistsByUserId(userId, db);

	return userPlaylists.get(playlistId);
};

const totalPlaylistReachByGenres = async (genreIds: Genre['id'][]) => {
	const matchingGenres = await dbHttp.query.Genres.findMany({
		where: inArray(Genres.id, genreIds),
		with: {
			_playlists: {
				columns: { playlistId: true },
				with: {
					playlist: {
						columns: {},
						with: {
							_providerAccounts: {
								columns: {},
								with: {
									providerAccount: {
										columns: { userId: true },
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

	const filteredGenres = matchingGenres.filter(genre => {
		return genre._playlists.some(playlist => {
			return playlist.playlist._providerAccounts.some(providerAccount => {
				return providerAccount.providerAccount.user.pitchReviewing === true;
			});
		});
	});

	const uniquePlaylists = new Set<string>();
	const uniqueCurators = new Set<string>();

	filteredGenres.forEach(genre => {
		genre._playlists.forEach(_playlist => {
			uniquePlaylists.add(_playlist.playlistId);
			_playlist.playlist._providerAccounts.forEach(providerAccount => {
				uniqueCurators.add(providerAccount.providerAccount.userId);
			});
		});
	});

	const totalPlaylists = uniquePlaylists.size;
	const totalCurators = uniqueCurators.size;
	const averagePlaylistsPerCurator = Math.ceil(totalPlaylists / totalCurators);

	return {
		totalPlaylists,
		totalCurators,
		averagePlaylistsPerCurator,
	};
};

export async function estimateGenresByPlaylistId(playlistId: string, db: Db) {
	const playlist = await getPlaylistById(playlistId, db);

	if (!playlist?.spotifyId)
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: 'Spotify playlist not found',
		});

	const spotifyAccount = playlist.providerAccounts.find(
		_pa => _pa.provider === 'spotify',
	);

	if (!spotifyAccount)
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: 'No Spotify account associated with that playlist.',
		});

	console.log('asking gpt for genres');

	const spotifyAccessToken = await getSpotifyAccessToken(spotifyAccount);

	console.log('spotifyAccessToken for genres => ', spotifyAccessToken);

	const rawTracks = await getSpotifyPlaylistTracks({
		spotifyId: playlist.spotifyId,
		accessToken: spotifyAccessToken,
		limit: 50,
	});

	// console.log('rawTracks => ', rawTracks);

	const tracks = rawTracks.map(t => ({
		track: t.track.name,
		artist: t.track.artists[0]?.name ?? 'unknown',
	}));

	const genres = await estimateGenresByTracks(tracks);

	console.log('genres => ', genres);

	return genres;
}

export async function upsertPlaylistGenres(
	playlistId: string,
	genreIds: Genre['id'][],
	db: Db,
) {
	await db.pool.transaction(async tx => {
		await Promise.allSettled(
			genreIds.map(async genreId => {
				await tx
					.insert(_Playlists_To_Genres)
					.values({
						playlistId,
						genreId,
					})
					.onConflictDoNothing({
						target: [_Playlists_To_Genres.playlistId, _Playlists_To_Genres.genreId],
					});
			}),
		);
	});
}

type GetPlaylistsByUserId = inferAsyncReturnType<typeof getPlaylistsByUserId>;
type UserGetPlaylistById = inferAsyncReturnType<typeof userGetPlaylistById>;
type TotalPlaylistReach = inferAsyncReturnType<typeof totalPlaylistReachByGenres>;

export {
	getPlaylistsByUserId,
	type GetPlaylistsByUserId,
	userGetPlaylistById,
	type UserGetPlaylistById,
	totalPlaylistReachByGenres,
	type TotalPlaylistReach,
};

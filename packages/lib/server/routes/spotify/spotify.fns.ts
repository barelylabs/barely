import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';

import type { Db } from '../../db';
import type { ProviderAccount } from '../provider-account/provider-account.schema';
import { newId } from '../../../utils/id';
import { dbHttp } from '../../db';
import { getSpotifyUserPlaylists } from '../../spotify/spotify.endpts.playlist';
import { refreshSpotifyAccessToken } from '../../spotify/spotify.endpts.token';
import { getSpotifyUser } from '../../spotify/spotify.endpts.user';
import { _Playlists_To_Genres } from '../genre/genre.sql';
import {
	estimateGenresByPlaylistId,
	upsertPlaylistGenres,
} from '../playlist/playlist.fns';
import { _Playlists_To_ProviderAccounts, Playlists } from '../playlist/playlist.sql';
import { ProviderAccounts } from '../provider-account/provider-account.sql';

const getSpotifyAccessToken = async (spotifyAccount: ProviderAccount) => {
	const { access_token, refresh_token, expires_at } = spotifyAccount;

	if (!access_token && !refresh_token)
		throw new Error('No Spotify access token found for user.');

	if (!access_token || (expires_at && expires_at < Date.now() / 1000)) {
		if (!refresh_token) throw new Error('No Spotify refresh token found for user.');
		const refreshedToken = await refreshSpotifyAccessToken({
			refreshToken: refresh_token,
		});

		console.log(
			'updating the access token in the db for account ',
			spotifyAccount.providerAccountId,
		);

		const expires_at = Math.floor(refreshedToken.expires_in + Date.now() / 1000);
		// console.log('new expires_at => ', expires_at);

		try {
			await dbHttp
				.update(ProviderAccounts)
				.set({
					access_token: refreshedToken.access_token,
					expires_at,
				})
				.where(
					and(
						eq(ProviderAccounts.provider, 'spotify'),
						eq(ProviderAccounts.providerAccountId, spotifyAccount.providerAccountId),
					),
				);

			// console.log('updateResult => ', updateResult);
		} catch (error) {
			console.log('error => ', error);
			throw new Error(
				'Error updating the access token in the db for account ' +
					spotifyAccount.providerAccountId,
			);
		}

		return refreshedToken.access_token;
	}

	return access_token;
};

const syncSpotifyAccountUser = async (spotifyAccountId: string, db: Db) => {
	console.log('syncing spotify user...');

	const spotifyAccount = await db.http.query.ProviderAccounts.findFirst({
		where: and(
			eq(ProviderAccounts.provider, 'spotify'),
			eq(ProviderAccounts.providerAccountId, spotifyAccountId),
		),
	});

	if (!spotifyAccount) return console.error('No spotify account found with that id.');

	const accessToken = await getSpotifyAccessToken(spotifyAccount).catch(err => {
		throw new TRPCError({
			code: 'INTERNAL_SERVER_ERROR',
			message: "We're having trouble with the Spotify API right now. Bear with us.",
			cause: err,
		});
	});

	// update spotify user info

	const spotifyUser = await getSpotifyUser({ accessToken });

	if (!spotifyUser) return;

	console.log('updating spotify user info...');

	await db.pool
		.update(ProviderAccounts)
		.set({
			username: spotifyUser.display_name,
			email: spotifyUser.email,
			image: spotifyUser.images[0]?.url,
		})
		.where(eq(ProviderAccounts.providerAccountId, spotifyAccountId));

	return;
};

const syncSpotifyAccountPlaylists = async (spotifyAccoundId: string, db: Db) => {
	console.log('syncing spotify playlists in the fn...');

	const spotifyAccount = await db.http.query.ProviderAccounts.findFirst({
		with: {
			user: {
				columns: {
					id: true,
					personalWorkspaceId: true,
				},
			},
		},
		where: and(
			eq(ProviderAccounts.provider, 'spotify'),
			eq(ProviderAccounts.providerAccountId, spotifyAccoundId),
		),
	});

	if (!spotifyAccount?.providerAccountId)
		return console.error('No spotify account found with that id.');

	const accessToken = await getSpotifyAccessToken(spotifyAccount).catch(err => {
		throw new TRPCError({
			code: 'INTERNAL_SERVER_ERROR',
			message: "We're having trouble with the Spotify API right now. Bear with us.",
			cause: err,
		});
	});

	// get spotify user playlists

	const userSpotifyPlaylists = await getSpotifyUserPlaylists({
		accessToken,
		userSpotifyId: spotifyAccount.providerAccountId,
	});

	if (!userSpotifyPlaylists) return;

	// sync user spotify playlists

	console.log('syncing spotify playlists...');

	console.log('userSpotifyPlaylists => ', userSpotifyPlaylists);

	for (const userSpotifyPlaylist of userSpotifyPlaylists) {
		await db.pool.transaction(async tx => {
			const existingPlaylist = await tx.query.Playlists.findFirst({
				where: eq(Playlists.spotifyId, userSpotifyPlaylist.id),
				columns: {
					id: true,
					workspaceId: true,
					curatorId: true,
				},
			});

			const playlistId = existingPlaylist?.id ?? newId('playlist');

			if (existingPlaylist) {
				await tx
					.update(Playlists)
					.set({
						name: userSpotifyPlaylist.name,
						public: userSpotifyPlaylist.public,
						description: userSpotifyPlaylist.description,
						imageUrl: userSpotifyPlaylist.images[0]?.url,
						totalTracks: userSpotifyPlaylist.tracks.total,
						curatorId: existingPlaylist.curatorId ?? spotifyAccount.user.id,
						workspaceId:
							existingPlaylist.workspaceId ?? spotifyAccount.user.personalWorkspaceId,
					})
					.where(eq(Playlists.id, playlistId));
			} else {
				await tx.insert(Playlists).values({
					id: playlistId,
					spotifyId: userSpotifyPlaylist.id,
					public: userSpotifyPlaylist.public,
					userOwned: userSpotifyPlaylist.owner.id === spotifyAccount.providerAccountId,
					name: userSpotifyPlaylist.name,
					description: userSpotifyPlaylist.description,
					imageUrl: userSpotifyPlaylist.images[0]?.url,
					totalTracks: userSpotifyPlaylist.tracks.total,
					forTesting: false,
					workspaceId: spotifyAccount.user.personalWorkspaceId,
					curatorId: spotifyAccount.user.id,
				});
			}

			await tx
				.insert(_Playlists_To_ProviderAccounts)
				.values({
					playlistId,
					providerAccountId: spotifyAccount.providerAccountId,
				})
				.onConflictDoNothing({
					target: [
						_Playlists_To_ProviderAccounts.playlistId,
						_Playlists_To_ProviderAccounts.providerAccountId,
					],
				});
		});

		const syncedPlaylist = await db.http.query.Playlists.findFirst({
			where: eq(Playlists.spotifyId, userSpotifyPlaylist.id),
			columns: {
				id: true,
				spotifyId: true,
			},
			with: {
				_genres: true,
				_providerAccounts: { with: { providerAccount: true } },
			},
		});

		if (!syncedPlaylist) return console.error('No synced playlist found with that id.');

		if (!syncedPlaylist._genres || syncedPlaylist._genres.length === 0) {
			console.log('generating playlist genres for playlist...');

			const gptGenreIds = await estimateGenresByPlaylistId(syncedPlaylist.id, db);

			await upsertPlaylistGenres(syncedPlaylist.id, gptGenreIds, db);
		}
	}

	return;
};

export { getSpotifyAccessToken, syncSpotifyAccountUser, syncSpotifyAccountPlaylists };

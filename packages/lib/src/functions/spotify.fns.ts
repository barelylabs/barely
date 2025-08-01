import type { NeonPool } from '@barely/db/pool';
import type { ProviderAccount } from '@barely/validators/schemas';
import { dbHttp } from '@barely/db/client';
import { dbPool } from '@barely/db/pool';
import { _Albums_To_Tracks } from '@barely/db/sql/album.sql';
import { _Playlists_To_Genres } from '@barely/db/sql/genre.sql';
import { _Playlists_To_ProviderAccounts, Playlists } from '@barely/db/sql/playlist.sql';
import { ProviderAccounts } from '@barely/db/sql/provider-account.sql';
import { SpotifyLinkedTracks, Tracks } from '@barely/db/sql/track.sql';
import { newId } from '@barely/utils';
import { TRPCError } from '@trpc/server';
import { and, desc, eq, isNull } from 'drizzle-orm';

import { getSpotifyUserPlaylists } from '../integrations/spotify/spotify.endpts.playlist';
import { refreshSpotifyAccessToken } from '../integrations/spotify/spotify.endpts.token';
import { getSpotifyUser } from '../integrations/spotify/spotify.endpts.user';
import { estimateGenresByPlaylistId, upsertPlaylistGenres } from './playlist.fns';

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

const syncSpotifyAccountUser = async (spotifyAccountId: string, pool: NeonPool) => {
	console.log('syncing spotify user...');

	const spotifyAccount = await dbHttp.query.ProviderAccounts.findFirst({
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

	console.log('updating spotify user info...');

	await dbPool(pool)
		.update(ProviderAccounts)
		.set({
			username: spotifyUser.display_name,
			email: spotifyUser.email,
			image: spotifyUser.images[0]?.url,
		})
		.where(eq(ProviderAccounts.providerAccountId, spotifyAccountId));

	return;
};

const syncSpotifyAccountPlaylists = async (spotifyAccoundId: string, pool: NeonPool) => {
	console.log('syncing spotify playlists in the fn...');

	const spotifyAccount = await dbHttp.query.ProviderAccounts.findFirst({
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

	// sync user spotify playlists

	console.log('syncing spotify playlists...');

	console.log('userSpotifyPlaylists => ', userSpotifyPlaylists);

	for (const userSpotifyPlaylist of userSpotifyPlaylists) {
		await dbPool(pool).transaction(async tx => {
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
						workspaceId: existingPlaylist.workspaceId,
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

		const syncedPlaylist = await dbPool(pool).query.Playlists.findFirst({
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

		if (syncedPlaylist._genres.length === 0) {
			console.log('generating playlist genres for playlist...');

			const gptGenreIds = await estimateGenresByPlaylistId(syncedPlaylist.id, pool);

			await upsertPlaylistGenres(syncedPlaylist.id, gptGenreIds, pool);
		}
	}

	return;
};

async function syncSpotifyTrack({
	spotifyTrack,
	albumId,
	workspaceId,
	pool,
}: {
	spotifyTrack: {
		id: string;
		name: string;
		album: {
			images: { url: string; width: number | null; height: number | null }[];
			release_date: string;
		};
		external_ids: { isrc: string };
		popularity: number;
		track_number?: number | null;
	};
	albumId: string;
	workspaceId: string;
	pool: NeonPool;
}) {
	console.log('syncing track => ', spotifyTrack.name);

	// Find existing track by ISRC in the workspace
	const existingTrackByIsrc = await dbHttp.query.Tracks.findFirst({
		where: and(
			eq(Tracks.workspaceId, workspaceId),
			eq(Tracks.isrc, spotifyTrack.external_ids.isrc),
		),
		with: {
			spotifyLinkedTracks: true,
		},
	});

	if (existingTrackByIsrc) {
		// Track exists - add/update Spotify link
		const existingSpotifyLink = existingTrackByIsrc.spotifyLinkedTracks.find(
			link => link.spotifyLinkedTrackId === spotifyTrack.id,
		);

		if (existingSpotifyLink) {
			// Update existing link
			await dbPool(pool)
				.update(SpotifyLinkedTracks)
				.set({
					spotifyPopularity: spotifyTrack.popularity,
					updatedAt: new Date(),
				})
				.where(eq(SpotifyLinkedTracks.spotifyLinkedTrackId, spotifyTrack.id));
		} else {
			// Add new Spotify link
			await dbPool(pool).insert(SpotifyLinkedTracks).values({
				trackId: existingTrackByIsrc.id,
				spotifyLinkedTrackId: spotifyTrack.id,
				spotifyPopularity: spotifyTrack.popularity,
				isDefault: false, // Will be updated later if needed
			});
		}

		// Update default based on popularity
		await updateDefaultSpotifyId(existingTrackByIsrc.id, pool);

		// Update track info with latest data
		const highestPopularity = await getHighestPopularityForTrack(
			existingTrackByIsrc.id,
			pool,
		);
		await dbPool(pool)
			.update(Tracks)
			.set({
				name: spotifyTrack.name,
				released: true,
				imageUrl: spotifyTrack.album.images[0]?.url,
				spotifyPopularity: highestPopularity,
				releaseDate: spotifyTrack.album.release_date,
			})
			.where(eq(Tracks.id, existingTrackByIsrc.id));

		// Add to album if not already linked
		await linkTrackToAlbum(
			existingTrackByIsrc.id,
			albumId,
			spotifyTrack.track_number,
			pool,
		);
		return;
	}

	// Check for existing track by name (no ISRC)
	const existingTrackByName = await dbHttp.query.Tracks.findFirst({
		where: and(
			eq(Tracks.workspaceId, workspaceId),
			eq(Tracks.name, spotifyTrack.name),
			isNull(Tracks.isrc),
		),
	});

	if (existingTrackByName) {
		// Update track with ISRC and add Spotify link
		await dbPool(pool)
			.update(Tracks)
			.set({
				isrc: spotifyTrack.external_ids.isrc,
				released: true,
				imageUrl: spotifyTrack.album.images[0]?.url,
				spotifyPopularity: spotifyTrack.popularity,
				releaseDate: spotifyTrack.album.release_date,
				spotifyId: spotifyTrack.id, // Set initial spotifyId
			})
			.where(eq(Tracks.id, existingTrackByName.id));

		// Add Spotify link
		await dbPool(pool).insert(SpotifyLinkedTracks).values({
			trackId: existingTrackByName.id,
			spotifyLinkedTrackId: spotifyTrack.id,
			spotifyPopularity: spotifyTrack.popularity,
			isDefault: true, // First Spotify ID is default
		});

		await linkTrackToAlbum(
			existingTrackByName.id,
			albumId,
			spotifyTrack.track_number,
			pool,
		);
		return;
	}

	// Create new track
	console.log(
		'creating new track => ',
		spotifyTrack.name,
		'ISRC => ',
		spotifyTrack.external_ids.isrc,
		'Spotify ID => ',
		spotifyTrack.id,
	);

	const [newTrack] = await dbPool(pool)
		.insert(Tracks)
		.values({
			id: newId('track'),
			workspaceId,
			name: spotifyTrack.name,
			spotifyId: spotifyTrack.id, // Set initial spotifyId
			isrc: spotifyTrack.external_ids.isrc,
			released: true,
			imageUrl: spotifyTrack.album.images[0]?.url,
			spotifyPopularity: spotifyTrack.popularity,
			releaseDate: spotifyTrack.album.release_date,
		})
		.returning();

	if (!newTrack) return;

	// Add Spotify link
	await dbPool(pool).insert(SpotifyLinkedTracks).values({
		trackId: newTrack.id,
		spotifyLinkedTrackId: spotifyTrack.id,
		spotifyPopularity: spotifyTrack.popularity,
		isDefault: true, // First Spotify ID is default
	});

	// Add to album
	await linkTrackToAlbum(newTrack.id, albumId, spotifyTrack.track_number, pool);
}

// Helper function to update default Spotify ID based on popularity
async function updateDefaultSpotifyId(trackId: string, pool: NeonPool) {
	// Get all Spotify links for this track
	const spotifyLinks = await dbPool(pool).query.SpotifyLinkedTracks.findMany({
		where: eq(SpotifyLinkedTracks.trackId, trackId),
		orderBy: [desc(SpotifyLinkedTracks.spotifyPopularity)],
	});

	if (spotifyLinks.length === 0) return;

	// Set the most popular as default
	const mostPopularId = spotifyLinks[0]?.spotifyLinkedTrackId;
	if (!mostPopularId) return;

	// Update all to not default
	await dbPool(pool)
		.update(SpotifyLinkedTracks)
		.set({ isDefault: false })
		.where(eq(SpotifyLinkedTracks.trackId, trackId));

	// Set the most popular as default
	await dbPool(pool)
		.update(SpotifyLinkedTracks)
		.set({ isDefault: true })
		.where(eq(SpotifyLinkedTracks.spotifyLinkedTrackId, mostPopularId));

	// Update the track's spotifyId to point to the default
	await dbPool(pool)
		.update(Tracks)
		.set({ spotifyId: mostPopularId })
		.where(eq(Tracks.id, trackId));
}

// Helper function to get highest popularity for a track
async function getHighestPopularityForTrack(trackId: string, pool: NeonPool) {
	const spotifyLinks = await dbPool(pool).query.SpotifyLinkedTracks.findMany({
		where: eq(SpotifyLinkedTracks.trackId, trackId),
		columns: { spotifyPopularity: true },
	});

	return Math.max(...spotifyLinks.map(link => link.spotifyPopularity ?? 0));
}

// Helper function to link track to album
async function linkTrackToAlbum(
	trackId: string,
	albumId: string,
	trackNumber: number | null | undefined,
	pool: NeonPool,
) {
	const existingLink = await dbPool(pool).query._Albums_To_Tracks.findFirst({
		where: and(
			eq(_Albums_To_Tracks.albumId, albumId),
			eq(_Albums_To_Tracks.trackId, trackId),
		),
	});

	if (!existingLink) {
		await dbPool(pool)
			.insert(_Albums_To_Tracks)
			.values({
				albumId,
				trackId,
				trackNumber: trackNumber ?? 1,
			});
	}
}

export {
	getSpotifyAccessToken,
	syncSpotifyAccountUser,
	syncSpotifyAccountPlaylists,
	syncSpotifyTrack,
	updateDefaultSpotifyId,
};

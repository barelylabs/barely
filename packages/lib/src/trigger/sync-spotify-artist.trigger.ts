import type { NeonPool } from '@barely/db/pool';
import { dbPool, makePool } from '@barely/db/pool';
import { Albums } from '@barely/db/sql/album.sql';
import { ProviderAccounts } from '@barely/db/sql/provider-account.sql';
import { SpotifyLinkedTracks, Tracks } from '@barely/db/sql/track.sql';
import { Workspaces } from '@barely/db/sql/workspace.sql';
import { ingestStreamingStat } from '@barely/tb/ingest';
import { isValidSpotifyId, newId } from '@barely/utils';
import { task } from '@trigger.dev/sdk/v3';
import { and, eq } from 'drizzle-orm';

import { libEnv } from '../../env';
import {
	getSpotifyAccessToken,
	syncSpotifyTrack,
	updateDefaultSpotifyId,
} from '../functions/spotify.fns';
import { getSeveralSpotifyAlbums } from '../integrations/spotify/spotify.endpts.album';
import {
	getSpotifyArtist,
	getSpotifyArtistAlbums,
} from '../integrations/spotify/spotify.endpts.artist';
import {
	getSeveralSpotifyTracks,
	getSpotifyTracksByAlbum,
} from '../integrations/spotify/spotify.endpts.track';
import { log } from '../utils/log';
import { normalizeSpotifyDate } from '../utils/spotify-date';

// Spotify API constants
const SPOTIFY_LIMITS = {
	ALBUMS_PER_REQUEST: 50,
	ALBUM_BATCH_SIZE: 10,
} as const;

interface SyncSpotifyArtistPayload {
	workspaceId: string;
	timestamp?: string;
}

/**
 * Syncs Spotify artist data for a workspace
 * - Adds new albums and tracks
 * - Updates stats for all albums and tracks
 * - Ingests all stats to Tinybird
 */
export const syncSpotifyArtist = task({
	id: 'sync-spotify-artist',
	maxDuration: 60 * 3, // 3 minutes
	run: async (payload: SyncSpotifyArtistPayload) => {
		const pool = makePool();
		const timestamp = payload.timestamp ?? new Date().toISOString();

		try {
			const db = dbPool(pool);

			// Get workspace with current data
			const workspace = await db.query.Workspaces.findFirst({
				where: eq(Workspaces.id, payload.workspaceId),
				columns: {
					id: true,
					handle: true,
					spotifyArtistId: true,
					spotifyFollowers: true,
					spotifyPopularity: true,
					plan: true,
				},
				with: {
					albums: {
						columns: {
							id: true,
							spotifyId: true,
							spotifyPopularity: true,
						},
					},
					tracks: {
						columns: {
							id: true,
							spotifyId: true,
							spotifyPopularity: true,
						},
						with: {
							spotifyLinkedTracks: {
								columns: {
									spotifyLinkedTrackId: true,
									isDefault: true,
									spotifyPopularity: true,
								},
							},
						},
					},
				},
			});

			if (!workspace) {
				await log({
					message: `Workspace not found: ${payload.workspaceId}`,
					type: 'errors',
					location: 'syncSpotifyArtist',
				});
				return { success: false, error: 'Workspace not found' };
			}

			if (!workspace.spotifyArtistId) {
				await log({
					message: `No Spotify artist ID for workspace ${workspace.handle}`,
					type: 'errors',
					location: 'syncSpotifyArtist',
				});
				return { success: false, error: 'No Spotify artist ID' };
			}

			if (!isValidSpotifyId(workspace.spotifyArtistId)) {
				await log({
					message: `Invalid Spotify artist ID for workspace ${workspace.handle}: ${workspace.spotifyArtistId}`,
					type: 'errors',
					location: 'syncSpotifyArtist',
				});
				return { success: false, error: 'Invalid Spotify artist ID' };
			}

			// Get Spotify access token
			const botSpotifyAccount = await db.query.ProviderAccounts.findFirst({
				where: and(
					eq(ProviderAccounts.provider, 'spotify'),
					eq(ProviderAccounts.providerAccountId, libEnv.BOT_SPOTIFY_ACCOUNT_ID),
				),
			});

			if (!botSpotifyAccount) {
				await log({
					message: 'No bot Spotify account found',
					type: 'errors',
					location: 'syncSpotifyArtist',
					mention: true,
				});
				return { success: false, error: 'No bot Spotify account' };
			}

			const accessToken = await getSpotifyAccessToken(botSpotifyAccount);

			if (!accessToken) {
				await log({
					message: 'Failed to get Spotify access token',
					type: 'errors',
					location: 'syncSpotifyArtist',
					mention: true,
				});
				return { success: false, error: 'No Spotify access token' };
			}

			console.log(
				`[SYNC START] Workspace: ${workspace.handle}, Artist: ${workspace.spotifyArtistId}, Time: ${timestamp}`,
			);

			// 1. Fetch artist stats
			const spotifyArtist = await getSpotifyArtist({
				accessToken,
				spotifyId: workspace.spotifyArtistId,
			});

			if (!spotifyArtist) {
				await log({
					message: `Failed to get Spotify artist for workspace ${workspace.handle}`,
					type: 'errors',
					location: 'syncSpotifyArtist',
				});
				return { success: false, error: 'Failed to fetch artist' };
			}

			// 2. Fetch all albums (up to 100)
			const spotifyAlbums = await getSpotifyArtistAlbums({
				accessToken,
				spotifyId: workspace.spotifyArtistId,
				needPopularity: true,
				limit: SPOTIFY_LIMITS.ALBUMS_PER_REQUEST,
				maxAlbums: 100,
			});

			if (!spotifyAlbums?.items) {
				await log({
					message: `Failed to fetch albums for workspace ${workspace.handle}`,
					type: 'errors',
					location: 'syncSpotifyArtist',
				});
				return { success: false, error: 'Failed to fetch albums' };
			}

			console.log(`Found ${spotifyAlbums.items.length} albums for ${workspace.handle}`);

			// 3. Sync new albums and tracks
			const existingAlbumIds = new Set(
				workspace.albums.map(a => a.spotifyId).filter((id): id is string => id !== null),
			);

			let newAlbumsCount = 0;
			let newTracksCount = 0;

			// Process albums in batches
			for (
				let i = 0;
				i < spotifyAlbums.items.length;
				i += SPOTIFY_LIMITS.ALBUM_BATCH_SIZE
			) {
				const albumBatch = spotifyAlbums.items.slice(
					i,
					i + SPOTIFY_LIMITS.ALBUM_BATCH_SIZE,
				);

				for (const album of albumBatch) {
					// Add small delay between albums
					if (i > 0 || albumBatch.indexOf(album) > 0) {
						await new Promise(resolve => setTimeout(resolve, 100));
					}

					try {
						if (!existingAlbumIds.has(album.id)) {
							// Create new album
							const [newAlbum] = await db
								.insert(Albums)
								.values({
									id: newId('album'),
									workspaceId: workspace.id,
									name: album.name,
									imageUrl: album.images[0]?.url,
									releaseDate: normalizeSpotifyDate(album.release_date),
									totalTracks: album.total_tracks,
									spotifyId: album.id,
									spotifyPopularity: album.popularity,
								})
								.returning();

							if (newAlbum) {
								newAlbumsCount++;

								// Fetch and sync tracks for new album
								const tracks = await getSpotifyTracksByAlbum({
									accessToken,
									albumId: album.id,
								});

								if (tracks?.items) {
									for (const track of tracks.items) {
										await syncSpotifyTrack({
											spotifyTrack: track,
											albumId: newAlbum.id,
											workspaceId: workspace.id,
											pool,
										});
										newTracksCount++;
									}
								}
							}
						}
					} catch (error) {
						console.error(`Failed to sync album "${album.name}" (${album.id}):`, error);
						// Continue with next album
					}
				}
			}

			// 4. Get updated lists of all albums and tracks from DB
			const updatedWorkspace = await db.query.Workspaces.findFirst({
				where: eq(Workspaces.id, payload.workspaceId),
				with: {
					albums: {
						columns: {
							spotifyId: true,
							spotifyPopularity: true,
						},
					},
					tracks: {
						columns: {
							id: true,
							spotifyId: true,
							spotifyPopularity: true,
						},
						with: {
							spotifyLinkedTracks: {
								columns: {
									spotifyLinkedTrackId: true,
									isDefault: true,
									spotifyPopularity: true,
								},
							},
						},
					},
				},
			});

			if (!updatedWorkspace) {
				throw new Error('Failed to get updated workspace data');
			}

			// 5. Fetch current stats for all albums
			const albumIds = updatedWorkspace.albums
				.map(album => album.spotifyId)
				.filter((id): id is string => id !== null && isValidSpotifyId(id));

			const albums =
				albumIds.length > 0 ?
					await getSeveralSpotifyAlbums({
						accessToken,
						albumIds,
					})
				:	[];

			// 6. Fetch current stats for all tracks
			const mainTrackIds = updatedWorkspace.tracks
				.map(track => track.spotifyId)
				.filter((id): id is string => id !== null && isValidSpotifyId(id));

			const linkedTrackIds = updatedWorkspace.tracks
				.flatMap(track => track.spotifyLinkedTracks)
				.map(linkedTrack => linkedTrack.spotifyLinkedTrackId)
				.filter(id => isValidSpotifyId(id));

			const trackIds = [...mainTrackIds, ...linkedTrackIds];
			const spotifyTracks =
				trackIds.length > 0 ?
					await getSeveralSpotifyTracks({
						accessToken,
						trackIds: trackIds,
					})
				:	[];

			// 7. Update SpotifyLinkedTracks with latest popularity
			const linkedTrackUpdates: { id: string; popularity: number }[] = [];
			const trackIdsToUpdateDefault: string[] = [];

			for (const track of updatedWorkspace.tracks) {
				for (const linkedTrack of track.spotifyLinkedTracks) {
					const spotifyTrack = spotifyTracks?.find(
						st => st.id === linkedTrack.spotifyLinkedTrackId,
					);
					if (spotifyTrack && spotifyTrack.popularity !== linkedTrack.spotifyPopularity) {
						linkedTrackUpdates.push({
							id: linkedTrack.spotifyLinkedTrackId,
							popularity: spotifyTrack.popularity,
						});
					}
				}
				trackIdsToUpdateDefault.push(track.id);
			}

			// Batch update linked tracks
			if (linkedTrackUpdates.length > 0) {
				try {
					await db.transaction(async tx => {
						for (const update of linkedTrackUpdates) {
							await tx
								.update(SpotifyLinkedTracks)
								.set({ spotifyPopularity: update.popularity })
								.where(eq(SpotifyLinkedTracks.spotifyLinkedTrackId, update.id));
						}
					});
				} catch (error) {
					await log({
						message: `Failed to update linked tracks for workspace ${workspace.id}: ${String(error)}`,
						type: 'errors',
						location: 'syncSpotifyArtist.linkedTracksUpdate',
					});
				}
			}

			// Update default Spotify IDs
			for (const trackId of trackIdsToUpdateDefault) {
				try {
					await updateDefaultSpotifyId(trackId, pool);
				} catch (error) {
					await log({
						message: `Failed to update default Spotify ID for track ${trackId}: ${String(error)}`,
						type: 'errors',
						location: 'syncSpotifyArtist.updateDefaultSpotifyId',
					});
				}
			}

			// 8. Prepare track stats
			const trackStats = updatedWorkspace.tracks
				.map(mainTrack => {
					const allSpotifyIds = mainTrack.spotifyLinkedTracks.map(
						t => t.spotifyLinkedTrackId,
					);

					const allPopularities = (spotifyTracks ?? [])
						.filter(st => allSpotifyIds.includes(st.id))
						.map(st => st.popularity);

					const highestPopularity = Math.max(...allPopularities, 0);

					const defaultLink = mainTrack.spotifyLinkedTracks.find(l => l.isDefault);
					const defaultSpotifyId =
						defaultLink?.spotifyLinkedTrackId ?? mainTrack.spotifyId;

					if (!defaultSpotifyId) {
						return null;
					}

					return {
						trackId: mainTrack.id,
						spotifyId: defaultSpotifyId,
						prevSpotifyPopularity: mainTrack.spotifyPopularity,
						spotifyPopularity: highestPopularity,
					};
				})
				.filter((stat): stat is NonNullable<typeof stat> => stat !== null);

			// 9. Record stats to database and Tinybird
			await recordSpotifyStats({
				pool,
				timestamp,
				workspaceId: workspace.id,
				artistStats: {
					spotifyId: spotifyArtist.id,
					spotifyFollowers: spotifyArtist.followers.total,
					spotifyPopularity: spotifyArtist.popularity,
					prevSpotifyFollowers: workspace.spotifyFollowers,
					prevSpotifyPopularity: workspace.spotifyPopularity,
				},
				albumStats:
					albums?.map(album => ({
						spotifyId: album.id,
						spotifyPopularity: album.popularity,
						prevSpotifyPopularity: updatedWorkspace.albums.find(
							a => a.spotifyId === album.id,
						)?.spotifyPopularity,
					})) ?? [],
				trackStats,
			});

			const syncDuration = Date.now() - new Date(timestamp).getTime();
			console.log(
				`[SYNC COMPLETE] Workspace: ${workspace.handle}, Duration: ${syncDuration}ms, New albums: ${newAlbumsCount}, New tracks: ${newTracksCount}`,
			);

			return {
				success: true,
				newAlbums: newAlbumsCount,
				newTracks: newTracksCount,
				totalAlbums: spotifyAlbums.items.length,
			};
		} catch (error) {
			await log({
				message: `Fatal error syncing workspace ${payload.workspaceId}: ${String(error)}`,
				type: 'errors',
				location: 'syncSpotifyArtist.fatal',
				mention: true,
			});
			throw error;
		} finally {
			try {
				await pool.end();
			} catch (cleanupError) {
				await log({
					message: `Failed to clean up database pool: ${String(cleanupError)}`,
					type: 'errors',
					location: 'syncSpotifyArtist.poolCleanup',
				});
			}
		}
	},
});

/**
 * Records Spotify statistics to database and Tinybird
 * Updates current values in database tables
 * Always records daily snapshots to Tinybird for time series data
 */
async function recordSpotifyStats(props: {
	pool: NeonPool;
	timestamp: string;
	workspaceId: string;
	artistStats: {
		spotifyId: string;
		spotifyFollowers: number;
		spotifyPopularity: number;
		prevSpotifyFollowers: number | null;
		prevSpotifyPopularity: number | null;
	};
	albumStats: {
		spotifyId: string;
		spotifyPopularity: number;
		prevSpotifyPopularity?: number | null;
	}[];
	trackStats: {
		trackId: string;
		spotifyId: string;
		spotifyPopularity: number;
		prevSpotifyPopularity?: number | null;
	}[];
}) {
	const { pool, timestamp, workspaceId, artistStats, albumStats, trackStats } = props;

	// Perform all database updates in a transaction
	const db = dbPool(pool);
	try {
		await db.transaction(async tx => {
			// Update workspace stats
			if (
				artistStats.prevSpotifyFollowers !== artistStats.spotifyFollowers ||
				artistStats.prevSpotifyPopularity !== artistStats.spotifyPopularity
			) {
				await tx
					.update(Workspaces)
					.set({
						spotifyFollowers: artistStats.spotifyFollowers,
						spotifyPopularity: artistStats.spotifyPopularity,
					})
					.where(eq(Workspaces.id, workspaceId));
			}

			// Batch update album stats
			const albumUpdates = albumStats.filter(
				album => album.prevSpotifyPopularity !== album.spotifyPopularity,
			);
			for (const album of albumUpdates) {
				await tx
					.update(Albums)
					.set({ spotifyPopularity: album.spotifyPopularity })
					.where(eq(Albums.spotifyId, album.spotifyId));
			}

			// Batch update track stats - using track ID, not Spotify ID
			const trackUpdates = trackStats.filter(
				track => track.prevSpotifyPopularity !== track.spotifyPopularity,
			);
			for (const track of trackUpdates) {
				const mainTrack = await tx.query.Tracks.findFirst({
					where: eq(Tracks.id, track.trackId),
				});
				if (mainTrack) {
					await tx
						.update(Tracks)
						.set({ spotifyPopularity: track.spotifyPopularity })
						.where(eq(Tracks.id, mainTrack.id));
				}
			}
		});
	} catch (error) {
		await log({
			message: `Failed to update database stats for workspace ${workspaceId}: ${String(error)}`,
			type: 'errors',
			location: 'recordSpotifyStats.dbTransaction',
			mention: true,
		});
		throw error;
	}

	// Ingest to Tinybird - always record daily snapshots
	const events = [];

	// Artist stats
	events.push({
		timestamp,
		workspaceId,
		type: 'artist' as const,
		spotifyId: artistStats.spotifyId,
		spotifyFollowers: artistStats.spotifyFollowers,
		spotifyPopularity: artistStats.spotifyPopularity,
	});

	// Album stats
	for (const album of albumStats) {
		events.push({
			timestamp,
			workspaceId,
			type: 'album' as const,
			spotifyId: album.spotifyId,
			spotifyPopularity: album.spotifyPopularity,
		});
	}

	// Track stats
	for (const track of trackStats) {
		events.push({
			timestamp,
			workspaceId,
			type: 'track' as const,
			spotifyId: track.spotifyId,
			spotifyPopularity: track.spotifyPopularity,
		});
	}

	if (events.length > 0) {
		try {
			await ingestStreamingStat(events);
			await log({
				message: `Recorded ${events.length} Spotify stats for workspace ${workspaceId}`,
				type: 'logs',
				location: 'recordSpotifyStats',
			});
		} catch (error) {
			await log({
				message: `Failed to ingest ${events.length} events to Tinybird for workspace ${workspaceId}: ${String(error)}`,
				type: 'errors',
				location: 'recordSpotifyStats.tinybirdIngest',
				mention: true,
			});
			// Don't re-throw - DB updates were successful
		}
	}
}

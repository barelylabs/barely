import type { NeonPool } from '@barely/db/pool';
import { dbPool, makePool } from '@barely/db/pool';
import { Albums } from '@barely/db/sql/album.sql';
import { ProviderAccounts } from '@barely/db/sql/provider-account.sql';
import { SpotifyLinkedTracks, Tracks } from '@barely/db/sql/track.sql';
import { Workspaces } from '@barely/db/sql/workspace.sql';
import { ingestStreamingStat } from '@barely/tb/ingest';
import { isValidSpotifyId, raise } from '@barely/utils';
import { schedules } from '@trigger.dev/sdk/v3';
import { and, eq, isNotNull } from 'drizzle-orm';

import { libEnv } from '../../env';
import { getSpotifyAccessToken, updateDefaultSpotifyId } from '../functions/spotify.fns';
import { getSeveralSpotifyAlbums } from '../integrations/spotify/spotify.endpts.album';
import { getSpotifyArtist } from '../integrations/spotify/spotify.endpts.artist';
import { getSeveralSpotifyTracks } from '../integrations/spotify/spotify.endpts.track';
import { log } from '../utils/log';

let pool: NeonPool | null = null;

const getPool = () => {
	if (pool) return pool;
	return (pool = makePool());
};

const cleanUpDbPool = async () => {
	if (pool) {
		await pool.end();
	}
	pool = null;
};

/**
 * Daily trigger to collect Spotify statistics for all workspaces
 * Runs at 11:50 PM ET every day
 * Collects artist followers, popularity, and track/album stats
 * Validates all Spotify IDs before API calls
 * Handles errors gracefully and always cleans up database pool
 */
export const streamingStatsTrigger = schedules.task({
	id: 'daily-streaming-stats',
	cron: { pattern: '50 23 * * *', timezone: 'America/New_York' },
	run: async payload => {
		const pool = getPool();
		try {
			// Get all workspaces with spotifyArtistId
			const db = dbPool(pool);
			const workspaces = await db.query.Workspaces.findMany({
				where: isNotNull(Workspaces.spotifyArtistId),
				columns: {
					id: true,
					spotifyArtistId: true,
					spotifyFollowers: true,
					spotifyPopularity: true,
				},
				with: {
					albums: {
						columns: {
							spotifyId: true,
							spotifyPopularity: true,
							spotifyStreams: true,
						},
					},
					tracks: {
						columns: {
							id: true,
							spotifyId: true,
							spotifyPopularity: true,
							spotifyStreams: true,
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

			if (!workspaces.length) {
				await log({
					message: 'No workspaces found with spotifyArtistId',
					type: 'logs',
					location: 'streamingStatsTrigger',
				});
				return;
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
					location: 'streamingStatsTrigger',
				});
				return;
			}

			const accessToken = await getSpotifyAccessToken(botSpotifyAccount);

			if (!accessToken) {
				await log({
					message: 'Failed to get Spotify access token',
					type: 'errors',
					location: 'streamingStatsTrigger',
					mention: true,
				});
				return;
			}

			// Track success/failure metrics
			let successCount = 0;
			let failureCount = 0;
			const startTime = Date.now();

			// Process each workspace
			for (const workspace of workspaces) {
				try {
					// Validate and get artist stats
					const artistId = workspace.spotifyArtistId ?? raise('No Spotify artist ID');
					if (!isValidSpotifyId(artistId)) {
						await log({
							message: `Invalid Spotify artist ID for workspace ${workspace.id}: ${artistId}`,
							type: 'errors',
							location: 'streamingStatsTrigger',
						});
						continue;
					}

					const spotifyArtist = await getSpotifyArtist({
						accessToken,
						spotifyId: artistId,
					});

					if (!spotifyArtist) {
						await log({
							message: `Failed to get Spotify artist for workspace ${workspace.id}`,
							type: 'errors',
							location: 'streamingStatsTrigger',
						});
						continue;
					}

					// Get album stats
					const albumIds = workspace.albums
						.map(album => album.spotifyId)
						.filter((id): id is string => id !== null && isValidSpotifyId(id));

					const albums =
						albumIds.length > 0 ?
							await getSeveralSpotifyAlbums({
								accessToken,
								albumIds,
							})
						:	[];

					if (albumIds.length > 0 && !albums?.length) {
						await log({
							message: `Failed to get Spotify albums for workspace ${workspace.id}`,
							type: 'errors',
							location: 'streamingStatsTrigger',
						});
					}

					// Get all tracks for the artist
					const mainTrackIds = workspace.tracks
						.map(track => track.spotifyId)
						.filter((id): id is string => id !== null && isValidSpotifyId(id));

					const linkedTracks = workspace.tracks.flatMap(
						track => track.spotifyLinkedTracks,
					);
					const linkedTrackIds = linkedTracks
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

					if (trackIds.length > 0 && !spotifyTracks?.length) {
						await log({
							message: `Failed to get Spotify tracks for workspace ${workspace.id}`,
							type: 'errors',
							location: 'streamingStatsTrigger',
						});
						// Don't skip entire workspace - continue with available data
					}

					// Batch update SpotifyLinkedTracks with latest popularity data
					const linkedTrackUpdates: { id: string; popularity: number }[] = [];
					const trackIdsToUpdateDefault: string[] = [];

					for (const track of workspace.tracks) {
						for (const linkedTrack of track.spotifyLinkedTracks) {
							const spotifyTrack = spotifyTracks?.find(
								st => st.id === linkedTrack.spotifyLinkedTrackId,
							);
							if (
								spotifyTrack &&
								spotifyTrack.popularity !== linkedTrack.spotifyPopularity
							) {
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
						const db = dbPool(pool);
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
								location: 'streamingStatsTrigger.linkedTracksUpdate',
								mention: true,
							});
							// Continue processing - don't fail the entire workspace
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
								location: 'streamingStatsTrigger.updateDefaultSpotifyId',
							});
							// Continue with other tracks
						}
					}

					const skippedTracks: string[] = [];
					const trackStats = workspace.tracks
						.map(mainTrack => {
							// Get all Spotify IDs for this track
							const allSpotifyIds = mainTrack.spotifyLinkedTracks.map(
								t => t.spotifyLinkedTrackId,
							);

							// Get popularity for all linked tracks
							const allPopularities = (spotifyTracks ?? [])
								.filter(st => allSpotifyIds.includes(st.id))
								.map(st => st.popularity);

							const highestPopularity = Math.max(...allPopularities, 0);

							// Get the default Spotify ID (most popular)
							const defaultLink = mainTrack.spotifyLinkedTracks.find(l => l.isDefault);
							const defaultSpotifyId =
								defaultLink?.spotifyLinkedTrackId ?? mainTrack.spotifyId;

							// Skip tracks with no Spotify ID
							if (!defaultSpotifyId) {
								skippedTracks.push(mainTrack.id);
								return null;
							}

							return {
								trackId: mainTrack.id, // Add track ID for proper updates
								spotifyId: defaultSpotifyId,
								prevSpotifyPopularity: mainTrack.spotifyPopularity,
								spotifyPopularity: highestPopularity,
							};
						})
						.filter((stat): stat is NonNullable<typeof stat> => stat !== null);

					// Log skipped tracks if any
					if (skippedTracks.length > 0) {
						await log({
							message: `Skipped ${skippedTracks.length} tracks without Spotify IDs in workspace ${workspace.id}: ${skippedTracks.join(', ')}`,
							type: 'logs',
							location: 'streamingStatsTrigger',
						});
					}

					// Record stats to Tinybird
					await recordSpotifyStats({
						pool,
						timestamp: payload.timestamp.toISOString(),
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
								prevSpotifyPopularity: workspace.albums.find(
									a => a.spotifyId === album.id,
								)?.spotifyPopularity,
							})) ?? [],
						trackStats,
					});
					successCount++;
				} catch (error) {
					failureCount++;
					await log({
						message: `Error processing workspace ${workspace.id}: ${String(error)}`,
						type: 'errors',
						location: 'streamingStatsTrigger',
						mention: true,
					});
				}
			}

			// Log summary metrics
			const duration = Date.now() - startTime;
			await log({
				message: `Streaming stats trigger completed: ${successCount} succeeded, ${failureCount} failed out of ${workspaces.length} workspaces. Duration: ${duration}ms`,
				type: failureCount > 0 ? 'errors' : 'logs',
				location: 'streamingStatsTrigger.summary',
				mention: failureCount > workspaces.length / 2, // Alert if more than half failed
			});
		} catch (error) {
			// Top-level error handling for database connection issues
			await log({
				message: `Fatal error in streaming stats trigger: ${String(error)}`,
				type: 'errors',
				location: 'streamingStatsTrigger.fatal',
				mention: true,
			});
			throw error; // Re-throw to mark the job as failed
		} finally {
			// Clean up database pool to prevent memory leak
			await cleanUpDbPool();
		}
	},
});

/**
 * Records Spotify statistics to database and Tinybird
 * Updates current values in database tables
 * Always records daily snapshots to Tinybird for time series data
 * @param props - Contains workspace data and stats to record
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
				// Find the main track by matching the default Spotify ID
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
		// Re-throw to handle in the main trigger
		throw error;
	}

	// Ingest to Tinybird - always record daily snapshots for proper time series data
	const events = [];

	// Artist stats - always record daily snapshot
	events.push({
		timestamp,
		workspaceId,
		type: 'artist' as const,
		spotifyId: artistStats.spotifyId,
		spotifyFollowers: artistStats.spotifyFollowers,
		spotifyPopularity: artistStats.spotifyPopularity,
	});

	// Album stats - record all albums
	for (const album of albumStats) {
		events.push({
			timestamp,
			workspaceId,
			type: 'album' as const,
			spotifyId: album.spotifyId,
			spotifyPopularity: album.spotifyPopularity,
		});
	}

	// Track stats - record all tracks
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
			// Don't re-throw - DB updates were successful, just Tinybird failed
		}
	}
}

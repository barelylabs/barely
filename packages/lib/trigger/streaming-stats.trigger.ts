import { schedules } from '@trigger.dev/sdk/v3';
import { and, eq, isNotNull } from 'drizzle-orm';

import { env } from '../env';
import { dbHttp } from '../server/db';
import { Albums } from '../server/routes/album/album.sql';
import { ProviderAccounts } from '../server/routes/provider-account/provider-account.sql';
import { getSpotifyAccessToken, updateDefaultSpotifyId } from '../server/routes/spotify/spotify.fns';
import { ingestStreamingStat } from '../server/routes/stat/stat.streaming.tb';
import { SpotifyLinkedTracks, Tracks } from '../server/routes/track/track.sql';
import { Workspaces } from '../server/routes/workspace/workspace.sql';
import { getSeveralSpotifyAlbums } from '../server/spotify/spotify.endpts.album';
import { getSpotifyArtist } from '../server/spotify/spotify.endpts.artist';
import { getSeveralSpotifyTracks } from '../server/spotify/spotify.endpts.track';
import { log } from '../utils/log';
import { raise } from '../utils/raise';

export const streamingStatsTrigger = schedules.task({
	id: 'daily-streaming-stats',
	cron: { pattern: '50 23 * * *', timezone: 'America/New_York' },
	run: async payload => {
		// Get all workspaces with spotifyArtistId
		const workspaces = await dbHttp.query.Workspaces.findMany({
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

		if (!workspaces?.length) {
			await log({
				message: 'No workspaces found with spotifyArtistId',
				type: 'logs',
				location: 'streamingStatsTrigger',
			});
			return;
		}

		// Get Spotify access token
		const botSpotifyAccount = await dbHttp.query.ProviderAccounts.findFirst({
			where: and(
				eq(ProviderAccounts.provider, 'spotify'),
				eq(ProviderAccounts.providerAccountId, env.BOT_SPOTIFY_ACCOUNT_ID),
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

		// Process each workspace
		for (const workspace of workspaces) {
			try {
				// Get artist stats
				const spotifyArtist = await getSpotifyArtist({
					accessToken,
					spotifyId: workspace.spotifyArtistId!,
				});

				if (!spotifyArtist) {
					await log({
						message: `Failed to get Spotify artist for workspace ${workspace.id}`,
						type: 'errors',
						location: 'streamingStatsTrigger',
					});
					continue;
				}

				// Get all albums for the artist
				const albums = await getSeveralSpotifyAlbums({
					accessToken,
					albumIds: workspace.albums
						.map(album => album.spotifyId)
						.filter(id => id !== null),
				});

				if (!albums) {
					await log({
						message: `Failed to get Spotify albums for workspace ${workspace.id}`,
						type: 'errors',
						location: 'streamingStatsTrigger',
					});
					continue;
				}

				// Get all tracks for the artist

				const mainTrackIds = workspace.tracks
					.map(track => track.spotifyId)
					.filter(id => id !== null);

				const linkedTracks = workspace.tracks.flatMap(track => track.spotifyLinkedTracks);
				const linkedTrackIds = linkedTracks.map(
					linkedTrack => linkedTrack.spotifyLinkedTrackId,
				);

				const spotifyTracks = await getSeveralSpotifyTracks({
					accessToken,
					trackIds: [...mainTrackIds, ...linkedTrackIds],
				});

				if (!spotifyTracks) {
					await log({
						message: `Failed to get Spotify tracks for workspace ${workspace.id}`,
						type: 'errors',
						location: 'streamingStatsTrigger',
					});
					continue;
				}

				// Update SpotifyLinkedTracks with latest popularity data
				for (const track of workspace.tracks) {
					for (const linkedTrack of track.spotifyLinkedTracks) {
						const spotifyTrack = spotifyTracks.find(
							st => st.id === linkedTrack.spotifyLinkedTrackId,
						);
						if (spotifyTrack) {
							// Update the linked track popularity
							await dbHttp
								.update(SpotifyLinkedTracks)
								.set({
									spotifyPopularity: spotifyTrack.popularity,
								})
								.where(
									eq(
										SpotifyLinkedTracks.spotifyLinkedTrackId,
										linkedTrack.spotifyLinkedTrackId,
									),
								);
						}
					}

					// Update default Spotify ID based on popularity
					await updateDefaultSpotifyId(track.id, dbHttp);
				}

				const trackStats = await Promise.all(
					workspace.tracks.map(async mainTrack => {
						// Get all Spotify IDs for this track
						const allSpotifyIds = mainTrack.spotifyLinkedTracks.map(
							t => t.spotifyLinkedTrackId,
						);

						// Get popularity for all linked tracks
						const allPopularities = spotifyTracks
							.filter(st => allSpotifyIds.includes(st.id))
							.map(st => st.popularity);

						const highestPopularity = Math.max(...allPopularities, 0);

						// Get the default Spotify ID (most popular)
						const defaultLink = mainTrack.spotifyLinkedTracks.find(l => l.isDefault);
						const defaultSpotifyId = defaultLink?.spotifyLinkedTrackId ?? mainTrack.spotifyId;

						return {
							spotifyId: defaultSpotifyId ?? raise('No default Spotify ID found'),
							prevSpotifyPopularity: mainTrack.spotifyPopularity,
							spotifyPopularity: highestPopularity,
						};
					}),
				);

				// Record stats to Tinybird
				await recordSpotifyStats({
					timestamp: payload.timestamp.toISOString(),
					workspaceId: workspace.id,
					artistStats: {
						spotifyId: spotifyArtist.id,
						spotifyFollowers: spotifyArtist.followers.total,
						spotifyPopularity: spotifyArtist.popularity,
						prevSpotifyFollowers: workspace.spotifyFollowers,
						prevSpotifyPopularity: workspace.spotifyPopularity,
					},
					albumStats: albums.map(album => ({
						spotifyId: album.id,
						spotifyPopularity: album.popularity,
						prevSpotifyPopularity: workspace.albums.find(a => a.spotifyId === album.id)
							?.spotifyPopularity,
					})),
					trackStats,
				});
			} catch (error) {
				await log({
					message: `Error processing workspace ${workspace.id}: ${String(error)}`,
					type: 'errors',
					location: 'streamingStatsTrigger',
					mention: true,
				});
			}
		}
	},
});

async function recordSpotifyStats(props: {
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
		spotifyId: string;
		spotifyPopularity: number;
		prevSpotifyPopularity?: number | null;
	}[];
}) {
	const { timestamp, workspaceId, artistStats, albumStats, trackStats } = props;

	// Update workspace stats
	if (
		artistStats.prevSpotifyFollowers !== artistStats.spotifyFollowers ||
		artistStats.prevSpotifyPopularity !== artistStats.spotifyPopularity
	) {
		await dbHttp
			.update(Workspaces)
			.set({
				spotifyFollowers: artistStats.spotifyFollowers,
				spotifyPopularity: artistStats.spotifyPopularity,
			})
			.where(eq(Workspaces.id, workspaceId));
	}

	// Update album stats
	for (const album of albumStats) {
		if (album.prevSpotifyPopularity !== album.spotifyPopularity) {
			await dbHttp
				.update(Albums)
				.set({
					spotifyPopularity: album.spotifyPopularity,
				})
				.where(eq(Albums.spotifyId, album.spotifyId));
		}
	}

	// Update track stats
	for (const track of trackStats) {
		if (track.prevSpotifyPopularity !== track.spotifyPopularity) {
			await dbHttp
				.update(Tracks)
				.set({
					spotifyPopularity: track.spotifyPopularity,
				})
				.where(eq(Tracks.spotifyId, track.spotifyId));
		}
	}

	const stats = [
		...albumStats.map(album => ({
			...album,
			type: 'album' as const,
			workspaceId,
			timestamp,
		})),
		...trackStats.map(track => ({
			...track,
			type: 'track' as const,
			workspaceId,
			timestamp,
		})),
		{
			type: 'artist' as const,
			workspaceId,
			spotifyId: artistStats.spotifyId,
			spotifyFollowers: artistStats.spotifyFollowers,
			spotifyPopularity: artistStats.spotifyPopularity,
			timestamp,
		},
	];

	await ingestStreamingStat(stats);

	await log({
		message: `Recorded Spotify stats for workspace ${props.workspaceId}`,
		type: 'logs',
		location: 'recordSpotifyStats',
	});
}

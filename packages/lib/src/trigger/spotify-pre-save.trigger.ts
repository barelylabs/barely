import { dbPool, makePool } from '@barely/db/pool';
import { SpotifyPreSaves } from '@barely/db/sql/spotify-pre-save.sql';
import { Tracks } from '@barely/db/sql/track.sql';
import { Workspaces } from '@barely/db/sql/workspace.sql';
import { sendEmail } from '@barely/email';
import { ReleaseNotificationEmailTemplate } from '@barely/email/templates/fm/release-notification';
import { logger, schedules, task, wait } from '@trigger.dev/sdk';
import { and, eq, isNotNull, isNull, lte, sql } from 'drizzle-orm';

import { refreshFanSpotifyToken } from '../integrations/spotify/spotify.endpts.fan-oauth';
import {
	saveTracksToSpotifyLibrary,
	spotifyTrackIdToUri,
} from '../integrations/spotify/spotify.endpts.library';

/**
 * Fulfill a single pre-save: refresh the fan's token and save the track to their library.
 */
async function fulfillSinglePreSave(
	preSave: {
		id: string;
		spotifyRefreshToken: string;
		spotifyAccessToken: string;
		spotifyTokenExpiresAt: number;
	},
	spotifyTrackId: string,
	pool: ReturnType<typeof makePool>,
) {
	try {
		// Refresh token if expired (or close to expiring)
		let accessToken = preSave.spotifyAccessToken;
		const now = Math.floor(Date.now() / 1000);

		if (preSave.spotifyTokenExpiresAt < now + 300) {
			// expires within 5 min
			const refreshed = await refreshFanSpotifyToken(preSave.spotifyRefreshToken);
			accessToken = refreshed.access_token;

			// Update tokens in DB
			await dbPool(pool)
				.update(SpotifyPreSaves)
				.set({
					spotifyAccessToken: refreshed.access_token,
					spotifyRefreshToken: refreshed.refresh_token ?? preSave.spotifyRefreshToken,
					spotifyTokenExpiresAt: Math.floor(Date.now() / 1000) + refreshed.expires_in,
				})
				.where(eq(SpotifyPreSaves.id, preSave.id));
		}

		// Save the track to the fan's library
		const uri = spotifyTrackIdToUri(spotifyTrackId);
		const results = await saveTracksToSpotifyLibrary(accessToken, [uri]);
		const result = results[0];

		if (result?.success) {
			await dbPool(pool)
				.update(SpotifyPreSaves)
				.set({ fulfilledAt: new Date() })
				.where(eq(SpotifyPreSaves.id, preSave.id));

			logger.log(`Fulfilled pre-save ${preSave.id}`);
			return { success: true };
		}

		// Record the error
		const errorMsg = result?.error ?? 'Unknown error';
		await dbPool(pool)
			.update(SpotifyPreSaves)
			.set({ fulfillmentError: errorMsg })
			.where(eq(SpotifyPreSaves.id, preSave.id));

		logger.error(`Failed to fulfill pre-save ${preSave.id}: ${errorMsg}`);
		return { success: false, error: errorMsg };
	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : 'Unknown error';
		await dbPool(pool)
			.update(SpotifyPreSaves)
			.set({ fulfillmentError: errorMsg })
			.where(eq(SpotifyPreSaves.id, preSave.id));

		logger.error(`Error fulfilling pre-save ${preSave.id}: ${errorMsg}`);
		return { success: false, error: errorMsg };
	}
}

/**
 * Manually trigger pre-save fulfillment for a specific track.
 * Conditions: track must have a spotifyId, and releaseDate must be today or earlier.
 */
export const fulfillPreSaves = task({
	id: 'fulfill-pre-saves',
	maxDuration: 60 * 5, // 5 minutes
	run: async (payload: { trackId: string }) => {
		const pool = makePool();

		try {
			// Get the track
			const track = await dbPool(pool).query.Tracks.findFirst({
				where: eq(Tracks.id, payload.trackId),
			});

			if (!track) {
				logger.error(`Track ${payload.trackId} not found`);
				return { fulfilled: 0, failed: 0, error: 'Track not found' };
			}

			if (!track.spotifyId) {
				logger.error(`Track ${payload.trackId} has no Spotify ID`);
				return { fulfilled: 0, failed: 0, error: 'Track has no Spotify ID' };
			}

			// Check release date
			if (track.releaseDate) {
				const today = new Date().toISOString().split('T')[0];
				if (today && track.releaseDate > today) {
					logger.error(
						`Track ${payload.trackId} hasn't been released yet (${track.releaseDate})`,
					);
					return { fulfilled: 0, failed: 0, error: 'Track not yet released' };
				}
			}

			// Get unfulfilled pre-saves for this track
			const preSaves = await dbPool(pool).query.SpotifyPreSaves.findMany({
				where: and(
					eq(SpotifyPreSaves.trackId, payload.trackId),
					isNull(SpotifyPreSaves.fulfilledAt),
				),
			});

			logger.log(
				`Found ${preSaves.length} unfulfilled pre-saves for track ${payload.trackId}`,
			);

			let fulfilled = 0;
			let failed = 0;

			for (const [index, preSave] of preSaves.entries()) {
				const result = await fulfillSinglePreSave(preSave, track.spotifyId, pool);
				if (result.success) {
					fulfilled++;
				} else {
					failed++;
				}

				// Brief pause between saves to respect Spotify rate limits
				if (index < preSaves.length - 1) {
					await wait.for({ seconds: 0.2 });
				}
			}

			// Mark track as released if not already
			if (!track.released) {
				await dbPool(pool)
					.update(Tracks)
					.set({ released: true })
					.where(eq(Tracks.id, payload.trackId));
			}

			// Send release notification emails to fans who have email + opted in
			const workspace = await dbPool(pool).query.Workspaces.findFirst({
				where: eq(Workspaces.id, track.workspaceId),
				columns: { name: true, handle: true },
			});

			const fulfilledPreSaves = await dbPool(pool).query.SpotifyPreSaves.findMany({
				where: and(
					eq(SpotifyPreSaves.trackId, payload.trackId),
					eq(SpotifyPreSaves.emailMarketingOptIn, true),
					isNotNull(SpotifyPreSaves.fulfilledAt),
				),
				with: {
					fan: { columns: { email: true } },
				},
			});

			const spotifyUrl =
				track.spotifyId ? `https://open.spotify.com/track/${track.spotifyId}` : undefined;

			for (const ps of fulfilledPreSaves) {
				const email = ps.fan?.email ?? ps.spotifyEmail;
				if (!email || ps.notificationSentAt) continue;

				try {
					await sendEmail({
						from: 'noreply@barely.fm',
						to: email,
						subject: `${track.name} is out now!`,
						type: 'marketing',
						listUnsubscribeUrl: `https://barely.fm/unsubscribe`,
						react: ReleaseNotificationEmailTemplate({
							artistName: workspace?.name ?? 'Artist',
							trackName: track.name,
							spotifyUrl,
						}),
					});

					await dbPool(pool)
						.update(SpotifyPreSaves)
						.set({ notificationSentAt: new Date() })
						.where(eq(SpotifyPreSaves.id, ps.id));
				} catch (err) {
					logger.error(
						`Failed to send notification for pre-save ${ps.id}: ${String(err)}`,
					);
				}

				await wait.for({ seconds: 0.1 });
			}

			logger.log(
				`Pre-save fulfillment complete: ${fulfilled} fulfilled, ${failed} failed`,
			);
			return { fulfilled, failed };
		} finally {
			await pool.end();
		}
	},
});

/**
 * Scheduled job: runs every hour, checks for tracks with release dates
 * that have passed, and fulfills their pre-saves.
 */
export const scheduledPreSaveFulfillment = schedules.task({
	id: 'scheduled-pre-save-fulfillment',
	cron: { pattern: '0 * * * *', timezone: 'UTC' }, // every hour
	maxDuration: 60 * 10, // 10 minutes
	run: async () => {
		const pool = makePool();

		try {
			const today = new Date().toISOString().split('T')[0];
			if (!today) {
				logger.error("Could not determine today's date");
				return;
			}

			// Find tracks with unfulfilled pre-saves that should have been released
			const tracksWithPendingPreSaves = await dbPool(pool)
				.select({
					trackId: SpotifyPreSaves.trackId,
					spotifyId: Tracks.spotifyId,
					releaseDate: Tracks.releaseDate,
					pendingCount: sql<number>`count(*)`.mapWith(Number),
				})
				.from(SpotifyPreSaves)
				.innerJoin(Tracks, eq(SpotifyPreSaves.trackId, Tracks.id))
				.where(and(isNull(SpotifyPreSaves.fulfilledAt), lte(Tracks.releaseDate, today)))
				.groupBy(SpotifyPreSaves.trackId, Tracks.spotifyId, Tracks.releaseDate);

			logger.log(
				`Found ${tracksWithPendingPreSaves.length} tracks with pending pre-saves`,
			);

			for (const trackGroup of tracksWithPendingPreSaves) {
				if (!trackGroup.spotifyId) {
					logger.log(`Skipping track ${trackGroup.trackId} - no Spotify ID yet`);
					continue;
				}

				logger.log(
					`Fulfilling ${trackGroup.pendingCount} pre-saves for track ${trackGroup.trackId}`,
				);

				const preSaves = await dbPool(pool).query.SpotifyPreSaves.findMany({
					where: and(
						eq(SpotifyPreSaves.trackId, trackGroup.trackId),
						isNull(SpotifyPreSaves.fulfilledAt),
					),
				});

				for (const preSave of preSaves) {
					await fulfillSinglePreSave(preSave, trackGroup.spotifyId, pool);
					await wait.for({ seconds: 0.2 });
				}
			}
		} finally {
			await pool.end();
		}
	},
});

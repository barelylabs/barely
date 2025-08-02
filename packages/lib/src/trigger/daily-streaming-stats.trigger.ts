import { dbPool, makePool } from '@barely/db/pool';
import { ProviderAccounts } from '@barely/db/sql/provider-account.sql';
import { Workspaces } from '@barely/db/sql/workspace.sql';
import { schedules, tasks } from '@trigger.dev/sdk/v3';
import { and, eq, isNotNull, ne } from 'drizzle-orm';

import type { syncSpotifyArtist } from './sync-spotify-artist.trigger';
import { libEnv } from '../../env';
import { log } from '../utils/log';

/**
 * Daily trigger to sync Spotify data and collect statistics for all workspaces
 * Runs at 11:50 PM ET every day
 * Delegates to sync-spotify-artist task for each workspace
 */
export const dailyStreamingStatsTrigger = schedules.task({
	id: 'daily-streaming-stats',
	cron: { pattern: '50 23 * * *', timezone: 'America/New_York' },
	run: async payload => {
		const pool = makePool();
		const timestamp = payload.timestamp.toISOString();

		try {
			// Get all workspaces with spotifyArtistId
			const db = dbPool(pool);
			const workspaces = await db.query.Workspaces.findMany({
				where: and(isNotNull(Workspaces.spotifyArtistId), ne(Workspaces.plan, 'free')),
				columns: {
					id: true,
					handle: true,
					spotifyArtistId: true,
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

			// Verify bot Spotify account exists
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
					mention: true,
				});
				return;
			}

			// Track success/failure metrics
			let successCount = 0;
			let failureCount = 0;
			const startTime = Date.now();

			// Process each workspace by triggering sync-spotify-artist
			// TODO: Consider parallel processing for better performance:
			// - Use Promise.allSettled() to process multiple workspaces concurrently
			// - Implement batching (e.g., process 5-10 workspaces at a time)
			// - Be mindful of Spotify API rate limits when parallelizing
			for (const workspace of workspaces) {
				try {
					await log({
						message: `Triggering sync for workspace ${workspace.handle}`,
						type: 'logs',
						location: 'streamingStatsTrigger',
					});

					// Trigger the sync task
					await tasks.trigger<typeof syncSpotifyArtist>('sync-spotify-artist', {
						workspaceId: workspace.id,
						timestamp,
					});

					successCount++;
				} catch (error) {
					failureCount++;
					await log({
						message: `Error triggering sync for workspace ${workspace.handle}: ${String(error)}`,
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
			// Top-level error handling
			await log({
				message: `Fatal error in streaming stats trigger: ${String(error)}`,
				type: 'errors',
				location: 'streamingStatsTrigger.fatal',
				mention: true,
			});
			throw error;
		} finally {
			// Clean up database pool
			try {
				await pool.end();
			} catch (cleanupError) {
				await log({
					message: `Failed to clean up database pool: ${String(cleanupError)}`,
					type: 'errors',
					location: 'streamingStatsTrigger.poolCleanup',
				});
			}
		}
	},
});

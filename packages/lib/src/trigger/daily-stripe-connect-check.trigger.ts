import { dbPool, makePool } from '@barely/db/pool';
import { Workspaces } from '@barely/db/sql/workspace.sql';
import { isProduction } from '@barely/utils';
import { schedules } from '@trigger.dev/sdk/v3';
import { and, eq, isNotNull } from 'drizzle-orm';

import { verifyStripeConnectStatus } from '../functions/stripe-connect.fns';
import { log } from '../utils/log';

/**
 * Daily trigger to verify Stripe Connect status for all workspaces
 * Runs at 2:00 AM ET every day
 * Checks workspaces with Stripe accounts that don't have charges enabled
 */
export const dailyStripeConnectCheckTrigger = schedules.task({
	id: 'daily-stripe-connect-check',
	cron: { pattern: '0 2 * * *', timezone: 'America/New_York' },
	run: async () => {
		const pool = makePool();

		try {
			// Get workspaces with Stripe Connect accounts that don't have charges enabled
			// These are the ones stuck in onboarding or having issues
			const db = dbPool(pool);
			const workspaces = await db.query.Workspaces.findMany({
				where:
					isProduction() ?
						and(
							isNotNull(Workspaces.stripeConnectAccountId),
							eq(Workspaces.stripeConnectChargesEnabled, false),
						)
					:	and(
							isNotNull(Workspaces.stripeConnectAccountId_devMode),
							eq(Workspaces.stripeConnectChargesEnabled_devMode, false),
						),
				columns: {
					id: true,
					handle: true,
					stripeConnectAccountId: true,
					stripeConnectAccountId_devMode: true,
					stripeConnectChargesEnabled: true,
					stripeConnectChargesEnabled_devMode: true,
					stripeConnectLastStatusCheck: true,
				},
			});

			if (!workspaces.length) {
				await log({
					message: 'No workspaces with pending Stripe Connect onboarding',
					type: 'logs',
					location: 'dailyStripeConnectCheck',
				});
				return;
			}

			await log({
				message: `Checking Stripe Connect status for ${workspaces.length} workspaces with charges disabled`,
				type: 'logs',
				location: 'dailyStripeConnectCheck',
			});

			// Track success/failure metrics
			let successCount = 0;
			let failureCount = 0;
			let updatedCount = 0;
			const startTime = Date.now();

			// Process each workspace
			for (const workspace of workspaces) {
				try {
					// Skip if checked within last 23 hours (to avoid duplicate checks)
					if (workspace.stripeConnectLastStatusCheck) {
						const lastCheck = new Date(workspace.stripeConnectLastStatusCheck);
						const hoursSinceLastCheck =
							(Date.now() - lastCheck.getTime()) / (1000 * 60 * 60);
						if (hoursSinceLastCheck < 23) {
							console.log(
								`Skipping ${workspace.handle} - checked ${hoursSinceLastCheck.toFixed(1)} hours ago`,
							);
							continue;
						}
					}

					const previousStatus =
						isProduction() ?
							workspace.stripeConnectChargesEnabled
						:	workspace.stripeConnectChargesEnabled_devMode;

					// Verify status with Stripe
					const chargesEnabled = await verifyStripeConnectStatus(workspace.id);

					// Track if status changed
					if (chargesEnabled !== previousStatus) {
						updatedCount++;
						await log({
							message: `Stripe Connect status changed for ${workspace.handle}: ${previousStatus} → ${chargesEnabled}`,
							type: 'logs',
							location: 'dailyStripeConnectCheck.statusChange',
						});
					}

					successCount++;
				} catch (error) {
					failureCount++;
					await log({
						message: `Error checking Stripe Connect for workspace ${workspace.handle}: ${String(error)}`,
						type: 'errors',
						location: 'dailyStripeConnectCheck.workspaceError',
					});
				}
			}

			// Log summary metrics
			const duration = Date.now() - startTime;
			await log({
				message: `Stripe Connect check completed: ${successCount} succeeded, ${failureCount} failed, ${updatedCount} updated out of ${workspaces.length} workspaces. Duration: ${duration}ms`,
				type: failureCount > 0 ? 'errors' : 'logs',
				location: 'dailyStripeConnectCheck.summary',
				mention: failureCount > workspaces.length / 2, // Alert if more than half failed
			});
		} catch (error) {
			// Top-level error handling
			await log({
				message: `Fatal error in Stripe Connect check trigger: ${String(error)}`,
				type: 'errors',
				location: 'dailyStripeConnectCheck.fatal',
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
					location: 'dailyStripeConnectCheck.poolCleanup',
				});
			}
		}
	},
});

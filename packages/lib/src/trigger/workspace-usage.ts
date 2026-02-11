import { dbHttp } from '@barely/db/client';
import { Workspaces } from '@barely/db/sql';
import { logger, schedules, task } from '@trigger.dev/sdk/v3';
import { eq, or } from 'drizzle-orm';

import type { UsageLimitType } from '../functions/usage.fns';
import { sendUsageWarningEmail } from '../functions/usage.fns';

/**
 * Daily scheduled task that resets usage counters for workspaces
 * on their individual billing cycle reset day.
 *
 * Runs daily and only resets workspaces where today matches their billingCycleStart.
 *
 * Resets monthly counters:
 * - eventUsage, emailUsage, linkUsage, invoiceUsage, taskUsage, fileUsage_billingCycle
 * - usageWarnings (JSONB tracking which warning emails have been sent)
 *
 * Does NOT reset cumulative counters:
 * - fanUsage (total fans ever added)
 * - pixelUsage (current active pixels - counted from table)
 * - fileUsage_total (total storage ever used)
 */
export const resetWorkspaceUsage = schedules.task({
	id: 'reset-workspace-usage',

	run: async () => {
		// Get today's day of month (1-31)
		const today = new Date();
		const todayDay = today.getDate();

		logger.info(`Running billing cycle reset for day ${todayDay}`);

		// Find workspaces where today is their billing cycle reset day
		// Handle both null (default to 1) and matching day
		const workspacesToReset = await dbHttp.query.Workspaces.findMany({
			where: or(
				eq(Workspaces.billingCycleStart, todayDay),
				// If billingCycleStart is null/0, treat as day 1
				todayDay === 1 ? eq(Workspaces.billingCycleStart, 0) : undefined,
			),
			columns: {
				id: true,
				name: true,
				billingCycleStart: true,
			},
		});

		if (workspacesToReset.length === 0) {
			logger.info(`No workspaces have billing cycle reset on day ${todayDay}`);
			return { resetCount: 0 };
		}

		logger.info(
			`Found ${workspacesToReset.length} workspaces to reset: ${workspacesToReset.map(w => w.name || w.id).join(', ')}`,
		);

		// Reset usage for each workspace
		const workspaceIds = workspacesToReset.map(w => w.id);

		await dbHttp
			.update(Workspaces)
			.set({
				eventUsage: 0,
				emailUsage: 0,
				linkUsage: 0,
				invoiceUsage: 0,
				fileUsage_billingCycle: 0,
				taskUsage: 0,
				usageWarnings: {}, // Reset warnings for new billing cycle
			})
			.where(or(...workspaceIds.map(id => eq(Workspaces.id, id))));

		logger.info(`Reset usage counters for ${workspacesToReset.length} workspaces`);

		return { resetCount: workspacesToReset.length, workspaceIds };
	},
});

/**
 * Send usage warning email task
 * Triggered when a workspace reaches usage thresholds (80%, 100%, 200%)
 */
export const sendUsageWarning = task({
	id: 'send-usage-warning-email',
	retry: {
		maxAttempts: 3,
		minTimeoutInMs: 1000,
		maxTimeoutInMs: 10000,
	},
	run: async ({
		workspaceId,
		limitType,
		threshold,
	}: {
		workspaceId: string;
		limitType: UsageLimitType;
		threshold: 80 | 100 | 200;
	}) => {
		console.log(
			`Sending usage warning email for workspace ${workspaceId}, limit type: ${limitType}, threshold: ${threshold}%`,
		);

		const result = await sendUsageWarningEmail(workspaceId, limitType, threshold);

		if (!result.success) {
			console.error(`Failed to send usage warning email: ${result.error}`);
			throw new Error(result.error ?? 'Unknown error sending usage warning email');
		}

		console.log(
			`Successfully sent ${threshold}% usage warning email for ${limitType} to workspace ${workspaceId}`,
		);

		return { success: true, threshold, limitType, workspaceId };
	},
});

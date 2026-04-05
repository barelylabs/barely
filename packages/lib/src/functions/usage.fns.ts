import type { PlanType } from '@barely/const';
import { WORKSPACE_PLANS } from '@barely/const';
import { dbHttp } from '@barely/db/client';
import { _Users_To_Workspaces, Fans, Links, Users, Workspaces } from '@barely/db/sql';
import { getAbsoluteUrl, getFirstAndLastDayOfBillingCycle } from '@barely/utils';
import { and, count, eq, gte, isNull, sql } from 'drizzle-orm';

/**
 * Usage limit types that can be enforced
 */
export type UsageLimitType =
	| 'fans'
	| 'members'
	| 'pixels'
	| 'links'
	| 'emails'
	| 'events'
	| 'tasks'
	| 'storage'
	| 'totalStorage'
	| 'invoices';

/**
 * Usage status returned by checkUsageLimit
 * - ok: Under 80% - no action needed
 * - warning_80: At or above 80% - send soft warning
 * - warning_100: At or above 100% - send stern warning (grace period until 200%)
 * - blocked_200: At or above 200% - hard block
 */
export type UsageStatus = 'ok' | 'warning_80' | 'warning_100' | 'blocked_200';

/**
 * Result of usage limit check
 */
export interface UsageLimitResult {
	status: UsageStatus;
	current: number;
	limit: number;
	percentage: number;
	shouldSendEmail: boolean;
	upgradeUrl: string;
	isUnlimited: boolean;
}

/**
 * Maps limit type to human-readable label for emails
 */
export function getResourceLabel(limitType: UsageLimitType): string {
	const labels: Record<UsageLimitType, string> = {
		fans: 'Fans/Contacts',
		members: 'Team Members',
		pixels: 'Retargeting Pixels',
		links: 'Links',
		emails: 'Emails Sent',
		events: 'Tracked Events',
		tasks: 'Tasks',
		storage: 'Monthly Storage',
		totalStorage: 'Total Storage',
		invoices: 'Invoices',
	};
	return labels[limitType];
}

/**
 * Gets the current usage count for a limit type
 * For monthly limits: counts records created within current billing cycle
 * For cumulative limits (fans, members, pixels): counts total records
 */
export async function getUsageCount(
	workspaceId: string,
	limitType: UsageLimitType,
	billingCycleStart?: number,
): Promise<number> {
	// Get workspace with usage counters
	const workspace = await dbHttp.query.Workspaces.findFirst({
		where: eq(Workspaces.id, workspaceId),
		columns: {
			fanUsage: true,
			memberUsage: true,
			pixelUsage: true,
			linkUsage: true,
			emailUsage: true,
			eventUsage: true,
			taskUsage: true,
			fileUsage_billingCycle: true,
			fileUsage_total: true,
			invoiceUsage: true,
			billingCycleStart: true,
		},
	});

	if (!workspace) {
		throw new Error('Workspace not found');
	}

	// Map limit type to the appropriate usage counter or database query
	switch (limitType) {
		case 'fans': {
			// Fans are cumulative - count from database for accuracy
			const fanCount = await dbHttp
				.select({ count: count() })
				.from(Fans)
				.where(and(eq(Fans.workspaceId, workspaceId), isNull(Fans.deletedAt)));
			return fanCount[0]?.count ?? 0;
		}

		case 'members': {
			// Members are cumulative - count from join table
			const memberCount = await dbHttp
				.select({ count: count() })
				.from(_Users_To_Workspaces)
				.where(eq(_Users_To_Workspaces.workspaceId, workspaceId));
			return memberCount[0]?.count ?? 0;
		}

		case 'pixels':
			// Pixels are cumulative - use stored counter (or could count from table)
			return workspace.pixelUsage;

		case 'links': {
			// Links are monthly - count from database for billing cycle
			const cycleStart = billingCycleStart ?? workspace.billingCycleStart ?? 1;
			const { firstDay } = getFirstAndLastDayOfBillingCycle(cycleStart);
			const linkCount = await dbHttp
				.select({ count: count() })
				.from(Links)
				.where(
					and(
						eq(Links.workspaceId, workspaceId),
						gte(Links.createdAt, firstDay),
						isNull(Links.deletedAt),
					),
				);
			return linkCount[0]?.count ?? 0;
		}

		case 'emails':
			return workspace.emailUsage;

		case 'events':
			return workspace.eventUsage;

		case 'tasks':
			return workspace.taskUsage;

		case 'storage':
			return workspace.fileUsage_billingCycle;

		case 'totalStorage':
			return workspace.fileUsage_total;

		case 'invoices':
			return workspace.invoiceUsage;

		default: {
			const exhaustiveCheck: never = limitType;
			throw new Error(`Unknown limit type: ${String(exhaustiveCheck)}`);
		}
	}
}

/**
 * Gets the usage limit for a limit type, considering workspace overrides
 */
export function getUsageLimit(
	workspace: {
		handle?: string | null;
		plan: PlanType;
		fanUsageLimitOverride?: number | null;
		memberUsageLimitOverride?: number | null;
		pixelUsageLimitOverride?: number | null;
		linkUsageLimitOverride?: number | null;
		emailUsageLimitOverride?: number | null;
		eventUsageLimitOverride?: number | null;
		taskUsageLimitOverride?: number | null;
		invoiceUsageLimitOverride?: number | null;
	},
	limitType: UsageLimitType,
): number {
	const plan = WORKSPACE_PLANS.get(workspace.plan);
	if (!plan) {
		throw new Error(
			`Invalid workspace plan: ${workspace.plan} (handle: ${workspace.handle ?? 'unknown'})`,
		);
	}

	// Check for override first
	const overrideMap: Partial<Record<UsageLimitType, number | null | undefined>> = {
		fans: workspace.fanUsageLimitOverride,
		members: workspace.memberUsageLimitOverride,
		pixels: workspace.pixelUsageLimitOverride,
		links: workspace.linkUsageLimitOverride,
		emails: workspace.emailUsageLimitOverride,
		events: workspace.eventUsageLimitOverride,
		tasks: workspace.taskUsageLimitOverride,
		invoices: workspace.invoiceUsageLimitOverride,
	};

	const override = overrideMap[limitType];
	if (override !== null && override !== undefined) {
		return override;
	}

	// Get limit from plan
	const limitMap: Record<UsageLimitType, number> = {
		fans: plan.usageLimits.fans,
		members: plan.usageLimits.members,
		pixels: plan.usageLimits.retargetingPixels,
		links: plan.usageLimits.newLinksPerMonth,
		emails: plan.usageLimits.emailsPerMonth,
		events: plan.usageLimits.trackedEventsPerMonth,
		tasks: plan.usageLimits.tasksPerMonth,
		storage: plan.usageLimits.storagePerMonth,
		totalStorage: plan.usageLimits.totalStorage,
		invoices: plan.usageLimits.invoicesPerMonth,
	};

	return limitMap[limitType];
}

/**
 * Checks if a usage warning was already sent for this limit type and threshold
 * within the current billing cycle
 */
export function hasWarningSent(
	workspace: {
		usageWarnings: Record<string, string>;
		billingCycleStart?: number | null;
	},
	limitType: UsageLimitType,
	threshold: 80 | 100 | 200,
): boolean {
	const key = `${limitType}_${threshold}`;
	const warningTimestamp = workspace.usageWarnings[key];

	if (!warningTimestamp) {
		return false;
	}

	// Check if the warning was sent within the current billing cycle
	const warningDate = new Date(warningTimestamp);
	const { firstDay } = getFirstAndLastDayOfBillingCycle(workspace.billingCycleStart ?? 1);

	return warningDate >= firstDay;
}

/**
 * Marks a warning as sent for this limit type and threshold
 */
export async function markWarningSent(
	workspaceId: string,
	limitType: UsageLimitType,
	threshold: 80 | 100 | 200,
): Promise<void> {
	const key = `${limitType}_${threshold}`;
	const timestamp = new Date().toISOString();

	await dbHttp
		.update(Workspaces)
		.set({
			usageWarnings: sql`${Workspaces.usageWarnings} || ${JSON.stringify({ [key]: timestamp })}::jsonb`,
		})
		.where(eq(Workspaces.id, workspaceId));
}

/**
 * Main enforcement function - checks usage and returns status with email decision
 *
 * Thresholds:
 * - 80%: Soft warning email (approaching limit)
 * - 100%: Stern warning email (at limit, grace period begins)
 * - 200%: Hard block (no new resources can be created)
 */
export async function checkUsageLimit(
	workspaceId: string,
	limitType: UsageLimitType,
	incrementBy = 1,
): Promise<UsageLimitResult> {
	// Get workspace with all usage-related fields
	const workspace = await dbHttp.query.Workspaces.findFirst({
		where: eq(Workspaces.id, workspaceId),
		columns: {
			id: true,
			handle: true,
			plan: true,
			billingCycleStart: true,
			usageWarnings: true,
			fanUsageLimitOverride: true,
			memberUsageLimitOverride: true,
			pixelUsageLimitOverride: true,
			linkUsageLimitOverride: true,
			emailUsageLimitOverride: true,
			eventUsageLimitOverride: true,
			taskUsageLimitOverride: true,
			invoiceUsageLimitOverride: true,
		},
	});

	if (!workspace) {
		throw new Error('Workspace not found');
	}

	const current = await getUsageCount(
		workspaceId,
		limitType,
		workspace.billingCycleStart ?? undefined,
	);
	const limit = getUsageLimit(workspace, limitType);
	const isUnlimited = limit === Number.MAX_SAFE_INTEGER;

	// If unlimited, always return ok
	if (isUnlimited) {
		return {
			status: 'ok',
			current,
			limit,
			percentage: 0,
			shouldSendEmail: false,
			upgradeUrl: '/settings/billing/upgrade',
			isUnlimited: true,
		};
	}

	// Calculate percentage after increment
	const projectedUsage = current + incrementBy;
	const percentage = (projectedUsage / limit) * 100;

	// Determine status based on thresholds
	let status: UsageStatus;
	let shouldSendEmail = false;

	if (percentage >= 200) {
		status = 'blocked_200';
		shouldSendEmail = !hasWarningSent(workspace, limitType, 200);
	} else if (percentage >= 100) {
		status = 'warning_100';
		shouldSendEmail = !hasWarningSent(workspace, limitType, 100);
	} else if (percentage >= 80) {
		status = 'warning_80';
		shouldSendEmail = !hasWarningSent(workspace, limitType, 80);
	} else {
		status = 'ok';
	}

	return {
		status,
		current,
		limit,
		percentage,
		shouldSendEmail,
		upgradeUrl: '/settings/billing/upgrade',
		isUnlimited: false,
	};
}

/**
 * Increments the usage counter for a limit type
 * Note: Some limit types (fans, members, pixels) are counted from tables,
 * so this only updates counters for monthly limits
 */
export async function incrementUsage(
	workspaceId: string,
	limitType: UsageLimitType,
	amount = 1,
): Promise<void> {
	// Map limit type to the appropriate column to update
	const columnMap: Partial<Record<UsageLimitType, keyof typeof Workspaces>> = {
		pixels: 'pixelUsage',
		links: 'linkUsage',
		emails: 'emailUsage',
		events: 'eventUsage',
		tasks: 'taskUsage',
		storage: 'fileUsage_billingCycle',
		totalStorage: 'fileUsage_total',
		invoices: 'invoiceUsage',
	};

	const column = columnMap[limitType];

	// Some types (fans, members) are counted from tables, not counters
	if (!column) {
		// For fans and members, the count comes from the actual records
		// No counter to increment
		return;
	}

	await dbHttp
		.update(Workspaces)
		.set({
			[column]: sql`${Workspaces[column]} + ${amount}`,
		})
		.where(eq(Workspaces.id, workspaceId));
}

/**
 * Resets all monthly usage counters for a workspace
 * Called at the start of a new billing cycle
 */
export async function resetMonthlyUsage(workspaceId: string): Promise<void> {
	await dbHttp
		.update(Workspaces)
		.set({
			linkUsage: 0,
			emailUsage: 0,
			eventUsage: 0,
			taskUsage: 0,
			invoiceUsage: 0,
			fileUsage_billingCycle: 0,
			usageWarnings: {}, // Reset warnings for new cycle
		})
		.where(eq(Workspaces.id, workspaceId));
}

/**
 * Gets a formatted error message for when a user is blocked
 */
export function getBlockedMessage(
	limitType: UsageLimitType,
	limit: number,
	planName: string,
): string {
	const resourceLabel = getResourceLabel(limitType);
	return `You've exceeded 200% of your ${resourceLabel.toLowerCase()} limit (${limit}) on the ${planName} plan. Please upgrade to continue creating ${resourceLabel.toLowerCase()}.`;
}

/**
 * Sends a usage warning email to the workspace owner
 */
export async function sendUsageWarningEmail(
	workspaceId: string,
	limitType: UsageLimitType,
	threshold: 80 | 100 | 200,
): Promise<{ success: boolean; error?: string }> {
	// Get workspace with owner user
	const workspace = await dbHttp.query.Workspaces.findFirst({
		where: eq(Workspaces.id, workspaceId),
		columns: {
			id: true,
			name: true,
			handle: true,
			plan: true,
			supportEmail: true,
		},
	});

	if (!workspace) {
		return { success: false, error: 'Workspace not found' };
	}

	// Get the workspace owner
	const ownerRelation = await dbHttp
		.select({
			userId: _Users_To_Workspaces.userId,
		})
		.from(_Users_To_Workspaces)
		.where(
			and(
				eq(_Users_To_Workspaces.workspaceId, workspaceId),
				eq(_Users_To_Workspaces.role, 'owner'),
			),
		)
		.limit(1);

	if (!ownerRelation[0]) {
		return { success: false, error: 'Workspace owner not found' };
	}

	const owner = await dbHttp.query.Users.findFirst({
		where: eq(Users.id, ownerRelation[0].userId),
		columns: {
			email: true,
			firstName: true,
		},
	});

	if (!owner?.email) {
		return { success: false, error: 'Owner email not found' };
	}

	// Get current usage info
	const current = await getUsageCount(workspaceId, limitType);
	const limit = getUsageLimit(workspace, limitType);
	const resourceLabel = getResourceLabel(limitType);

	// Build upgrade URL
	const upgradeUrl = getAbsoluteUrl(
		'app',
		`/${workspace.handle}/settings/billing/upgrade`,
	);

	// Select template and subject based on threshold
	let emailTemplate: React.ReactElement;
	let subject: string;

	const templateProps = {
		resourceType: limitType,
		resourceLabel,
		currentUsage: current,
		limit,
		workspaceName: workspace.name,
		upgradeUrl,
	};

	// Dynamic import email templates to avoid loading email module during test imports
	const {
		UsageWarning80EmailTemplate,
		UsageWarning100EmailTemplate,
		UsageBlocked200EmailTemplate,
	} = await import('@barely/email/templates');

	switch (threshold) {
		case 80:
			emailTemplate = UsageWarning80EmailTemplate(templateProps);
			subject = `You're approaching your ${resourceLabel} limit on Barely`;
			break;
		case 100:
			emailTemplate = UsageWarning100EmailTemplate(templateProps);
			subject = `You've reached your ${resourceLabel} limit on Barely`;
			break;
		case 200:
			emailTemplate = UsageBlocked200EmailTemplate(templateProps);
			subject = `${resourceLabel} paused on your Barely workspace`;
			break;
	}

	// Dynamic import sendEmail to avoid loading email module during test imports
	const { sendEmail } = await import('@barely/email');

	// Send email
	const result = await sendEmail({
		from: 'notifications@barely.ai',
		fromFriendlyName: 'Barely',
		to: owner.email,
		subject,
		type: 'transactional',
		react: emailTemplate,
	});

	if (result.error) {
		const errorMessage =
			typeof result.error === 'string' ? result.error : JSON.stringify(result.error);
		console.error('Failed to send usage warning email:', errorMessage);
		return { success: false, error: errorMessage };
	}

	// Mark warning as sent
	await markWarningSent(workspaceId, limitType, threshold);

	return { success: true };
}

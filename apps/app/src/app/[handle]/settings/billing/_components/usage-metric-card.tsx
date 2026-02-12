'use client';

import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@barely/hooks';
import { cn, nFormatter } from '@barely/utils';

import { Button } from '@barely/ui/button';
import { Progress } from '@barely/ui/progress';
import { InfoTooltip } from '@barely/ui/tooltip';
import { Text } from '@barely/ui/typography';

/**
 * Usage status based on percentage
 * - ok: 0-79%
 * - warning: 80-99%
 * - critical: 100%+
 */
export type UsageStatusLevel = 'ok' | 'warning' | 'critical';

export interface UsageMetricCardProps {
	/** Label for the usage metric (e.g., "Link Clicks", "Emails Sent") */
	label: string;
	/** Current usage count */
	current: number;
	/** Maximum allowed usage */
	limit: number;
	/** Unit label for the metric (e.g., "clicks", "emails") */
	unit?: string;
	/** Tooltip content explaining the metric */
	tooltipContent?: ReactNode;
	/** Whether the limit is unlimited (e.g., MAX_SAFE_INTEGER) */
	isUnlimited?: boolean;
	/** Whether to show the upgrade CTA when usage is high */
	showUpgradeCta?: boolean;
	/** Custom class name for styling */
	className?: string;
}

/**
 * Determines the usage status level based on percentage
 */
export function getUsageStatusLevel(percentage: number): UsageStatusLevel {
	if (percentage >= 100) return 'critical';
	if (percentage >= 80) return 'warning';
	return 'ok';
}

/**
 * Returns tailwind classes for progress bar indicator based on status
 */
function getProgressIndicatorClass(status: UsageStatusLevel): string {
	switch (status) {
		case 'critical':
			return '[&>div]:bg-red-500';
		case 'warning':
			return '[&>div]:bg-yellow-500';
		case 'ok':
		default:
			return '[&>div]:bg-green-500';
	}
}

/**
 * UsageMetricCard - Displays a single usage metric with progress bar
 *
 * Features:
 * - Color-coded progress bar (green < 80%, yellow 80-99%, red >= 100%)
 * - Percentage display
 * - Unlimited handling
 * - Optional upgrade CTA
 */
export function UsageMetricCard({
	label,
	current,
	limit,
	unit = '',
	tooltipContent,
	isUnlimited = false,
	showUpgradeCta = true,
	className,
}: UsageMetricCardProps) {
	const router = useRouter();
	const { handle } = useWorkspace();

	// Calculate percentage and status
	const { status, displayPercentage } = useMemo(() => {
		if (isUnlimited || limit === 0) {
			return { status: 'ok' as UsageStatusLevel, displayPercentage: '0' };
		}
		const pct = (current / limit) * 100;
		return {
			status: getUsageStatusLevel(pct),
			displayPercentage: pct.toFixed(1),
		};
	}, [current, limit, isUnlimited]);

	// Show upgrade CTA when at warning level or above
	const shouldShowUpgrade = showUpgradeCta && status !== 'ok';

	const progressIndicatorClass = getProgressIndicatorClass(status);

	return (
		<div className={cn('flex flex-col space-y-2', className)}>
			{/* Header with label and optional tooltip */}
			<div className='flex items-center space-x-2'>
				<Text variant='lg/semibold'>{label}</Text>
				{tooltipContent && <InfoTooltip content={tooltipContent} />}
			</div>

			{/* Usage text */}
			<Text variant='sm/normal'>
				{isUnlimited ?
					`${nFormatter(current)} ${unit}`.trim()
				:	<>
						{nFormatter(current)} / {nFormatter(limit)} {unit} ({displayPercentage}%)
					</>
				}
			</Text>

			{/* Progress bar - only show if not unlimited */}
			{!isUnlimited && (
				<Progress
					size='sm'
					value={current}
					max={limit}
					className={cn('bg-muted', progressIndicatorClass)}
				/>
			)}

			{/* Upgrade CTA - show when usage is at warning or critical level */}
			{shouldShowUpgrade && (
				<div className='pt-2'>
					<Button
						size='sm'
						look={status === 'critical' ? 'primary' : 'secondary'}
						onClick={() => router.push(`/${handle}/settings/billing/upgrade`)}
					>
						{status === 'critical' ? 'Upgrade Now' : 'View Upgrade Options'}
					</Button>
				</div>
			)}
		</div>
	);
}

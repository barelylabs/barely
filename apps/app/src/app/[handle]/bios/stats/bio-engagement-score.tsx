'use client';

import { useBioStatFilters } from '@barely/hooks';
import { cn } from '@barely/utils';
import { useSuspenseQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Card } from '@barely/ui/card';
import { Progress } from '@barely/ui/progress';
import { H, Text } from '@barely/ui/typography';

export function BioEngagementScore() {
	const { filtersWithHandle } = useBioStatFilters();

	const trpc = useTRPC();
	const { data: metrics } = useSuspenseQuery(
		trpc.stat.bioEngagementMetrics.queryOptions(filtersWithHandle),
	);

	const engagementLevel =
		metrics.engagement_score >= 70 ? 'excellent'
		: metrics.engagement_score >= 50 ? 'good'
		: metrics.engagement_score >= 30 ? 'fair'
		: 'needs improvement';

	const engagementColor =
		engagementLevel === 'excellent' ? 'text-green-600'
		: engagementLevel === 'good' ? 'text-blue-600'
		: engagementLevel === 'fair' ? 'text-yellow-600'
		: 'text-red-600';

	const sessionDurationCategories = [
		{ label: '0-10s', value: metrics.sessions_0_10s, color: 'bg-red-500' },
		{ label: '10-30s', value: metrics.sessions_10_30s, color: 'bg-orange-500' },
		{ label: '30-60s', value: metrics.sessions_30_60s, color: 'bg-yellow-500' },
		{ label: '1-3m', value: metrics.sessions_1_3m, color: 'bg-green-500' },
		{ label: '3m+', value: metrics.sessions_over_3m, color: 'bg-blue-500' },
	];

	const totalSessions = sessionDurationCategories.reduce(
		(sum, cat) => sum + cat.value,
		0,
	);

	return (
		<div className='grid gap-4 md:grid-cols-2'>
			<Card className='p-6'>
				<div className='mb-4'>
					<H size='4'>Engagement Score</H>
					<Text variant='sm/normal' muted>
						Overall user engagement quality
					</Text>
				</div>

				<div className='space-y-4'>
					<div className='text-center'>
						<H size='1' className={cn('mb-2', engagementColor)}>
							{metrics.engagement_score.toFixed(0)}
						</H>
						<Text variant='md/semibold' className='capitalize'>
							{engagementLevel}
						</Text>
					</div>

					<Progress value={metrics.engagement_score} className='h-3' />

					<div className='space-y-2 border-t pt-4'>
						<div className='flex justify-between'>
							<Text variant='sm/normal' muted>
								Session Click Rate
							</Text>
							<Text variant='sm/semibold'>
								{(metrics.session_click_rate * 100).toFixed(1)}%
							</Text>
						</div>
						<div className='flex justify-between'>
							<Text variant='sm/normal' muted>
								Overall CTR
							</Text>
							<Text variant='sm/semibold'>{(metrics.overall_ctr * 100).toFixed(2)}%</Text>
						</div>
						<div className='flex justify-between'>
							<Text variant='sm/normal' muted>
								Email Capture Rate
							</Text>
							<Text variant='sm/semibold'>
								{(metrics.session_email_rate * 100).toFixed(2)}%
							</Text>
						</div>
						<div className='flex justify-between'>
							<Text variant='sm/normal' muted>
								Quick Bounce Rate
							</Text>
							<Text variant='sm/semibold'>
								{(metrics.quick_bounce_rate * 100).toFixed(1)}%
							</Text>
						</div>
					</div>
				</div>
			</Card>

			<Card className='p-6'>
				<div className='mb-4'>
					<H size='4'>Session Duration</H>
					<Text variant='sm/normal' muted>
						Time spent on bio page
					</Text>
				</div>

				<div className='space-y-4'>
					<div className='text-center'>
						<H size='2'>{Math.floor(metrics.avg_session_duration)}s</H>
						<Text variant='sm/normal' muted>
							Average Duration
						</Text>
					</div>

					<div className='space-y-2'>
						{sessionDurationCategories.map(category => {
							const percentage =
								totalSessions > 0 ? (category.value / totalSessions) * 100 : 0;
							return (
								<div key={category.label}>
									<div className='mb-1 flex justify-between'>
										<Text variant='sm/normal'>{category.label}</Text>
										<Text variant='sm/normal' muted>
											{percentage.toFixed(1)}%
										</Text>
									</div>
									<div className='h-2 w-full rounded-full bg-gray-200'>
										<div
											className={cn('h-2 rounded-full', category.color)}
											style={{ width: `${percentage}%` }}
										/>
									</div>
								</div>
							);
						})}
					</div>

					<div className='border-t pt-4'>
						<div className='flex justify-between'>
							<Text variant='sm/normal' muted>
								Median Duration
							</Text>
							<Text variant='sm/semibold'>
								{Math.floor(metrics.median_session_duration)}s
							</Text>
						</div>
						<div className='flex justify-between'>
							<Text variant='sm/normal' muted>
								Max Duration
							</Text>
							<Text variant='sm/semibold'>
								{Math.floor(metrics.max_session_duration / 60)}m{' '}
								{metrics.max_session_duration % 60}s
							</Text>
						</div>
					</div>
				</div>
			</Card>
		</div>
	);
}

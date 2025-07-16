'use client';

import type { IconKey } from '@barely/ui/icon';
import { cn } from '@barely/utils';

import { Icon } from '@barely/ui/icon';

interface MetricData {
	monthlyListeners: number;
	streams: number;
	followers: number;
	engagementRate: string;
	emailSubscribers?: number;
	monthlyRevenue: string;
	instagram?: number;
	tiktok?: number;
	youtube?: number;
	patreon?: number;
}

interface CaseStudyMetricsProps {
	before: MetricData;
	after: MetricData;
}

export function CaseStudyMetrics({ before, after }: CaseStudyMetricsProps) {
	const calculateGrowth = (beforeVal: number, afterVal: number) => {
		return Math.round(((afterVal - beforeVal) / beforeVal) * 100);
	};

	const metrics: {
		label: string;
		iconName: IconKey;
		iconColor: string;
		before: string;
		after: string;
		growth: number;
		highlight?: boolean;
	}[] = [
		{
			label: 'Monthly Listeners',
			iconName: 'headphones',
			iconColor: 'text-purple-500',
			before: before.monthlyListeners.toLocaleString(),
			after: after.monthlyListeners.toLocaleString(),
			growth: calculateGrowth(before.monthlyListeners, after.monthlyListeners),
			highlight: true,
		},
		{
			label: 'Total Streams',
			iconName: 'music',
			iconColor: 'text-blue-500',
			before: before.streams.toLocaleString(),
			after: after.streams.toLocaleString(),
			growth: calculateGrowth(before.streams, after.streams),
		},
		{
			label: 'Followers',
			iconName: 'users',
			iconColor: 'text-pink-500',
			before: before.followers.toLocaleString(),
			after: after.followers.toLocaleString(),
			growth: calculateGrowth(before.followers, after.followers),
		},
		{
			label: 'Engagement Rate',
			iconName: 'heart',
			iconColor: 'text-red-500',
			before: before.engagementRate,
			after: after.engagementRate,
			growth: 0, // Calculate separately if needed
		},
		{
			label: 'Email Subscribers',
			iconName: 'email',
			iconColor: 'text-green-500',
			before: (before.emailSubscribers ?? 0).toLocaleString(),
			after: (after.emailSubscribers ?? 0).toLocaleString(),
			growth:
				before.emailSubscribers ?
					calculateGrowth(before.emailSubscribers, after.emailSubscribers ?? 0)
				:	0,
		},
		{
			label: 'Monthly Revenue',
			iconName: 'dollar',
			iconColor: 'text-yellow-500',
			before: before.monthlyRevenue,
			after: after.monthlyRevenue,
			growth: 0, // Calculate from dollar amounts if needed
			highlight: true,
		},
	];

	// Add social metrics if they exist
	if (before.instagram !== undefined && after.instagram !== undefined) {
		metrics.push({
			label: 'Instagram Followers',
			iconName: 'instagram',
			iconColor: 'text-pink-500',
			before: before.instagram.toLocaleString(),
			after: after.instagram.toLocaleString(),
			growth: calculateGrowth(before.instagram, after.instagram),
		});
	}

	if (before.tiktok !== undefined && after.tiktok !== undefined) {
		metrics.push({
			label: 'TikTok Followers',
			iconName: 'tiktok',
			iconColor: 'text-white',
			before: before.tiktok.toLocaleString(),
			after: after.tiktok.toLocaleString(),
			growth: calculateGrowth(before.tiktok, after.tiktok),
		});
	}

	if (before.youtube !== undefined && after.youtube !== undefined) {
		metrics.push({
			label: 'YouTube Subscribers',
			iconName: 'youtube',
			iconColor: 'text-red-500',
			before: before.youtube.toLocaleString(),
			after: after.youtube.toLocaleString(),
			growth: calculateGrowth(before.youtube, after.youtube),
		});
	}

	if (before.patreon !== undefined && after.patreon !== undefined) {
		metrics.push({
			label: 'Patreon Supporters',
			iconName: 'heart',
			iconColor: 'text-orange-500',
			before: before.patreon.toLocaleString(),
			after: after.patreon.toLocaleString(),
			growth: calculateGrowth(before.patreon, after.patreon),
		});
	}

	return (
		<div className='glass rounded-2xl p-8'>
			<h3 className='mb-8 text-center text-2xl font-semibold text-white'>
				Campaign Results Dashboard
			</h3>

			<div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
				{metrics.map((metric, index) => (
					<div
						key={metric.label}
						className={cn(
							'rounded-xl p-6',
							metric.highlight ?
								'border border-purple-500/30 bg-purple-500/10'
							:	'bg-white/5',
						)}
						style={{
							animationDelay: `${index * 100}ms`,
						}}
					>
						<div className='mb-4 flex items-center gap-2'>
							{(() => {
								const IconComponent = Icon[metric.iconName];
								return <IconComponent className={cn('h-5 w-5', metric.iconColor)} />;
							})()}
							<p className='text-sm text-white/60'>{metric.label}</p>
						</div>

						<div className='space-y-3'>
							<div className='flex items-center justify-between'>
								<span className='text-sm text-white/40'>Before</span>
								<span className='text-lg text-white/70'>{metric.before}</span>
							</div>

							<div className='flex items-center justify-between'>
								<span className='text-sm text-white/40'>After</span>
								<span className='text-lg font-semibold text-white'>{metric.after}</span>
							</div>

							{metric.growth > 0 && (
								<div className='border-t border-white/10 pt-3'>
									<span
										className={cn(
											'text-2xl font-bold',
											metric.growth > 100 ? 'text-green-500' : 'text-green-400',
										)}
									>
										+{metric.growth}%
									</span>
								</div>
							)}
						</div>
					</div>
				))}
			</div>

			<div className='mt-8 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-center'>
				<p className='font-semibold text-green-500'>
					Overall Growth:{' '}
					{calculateGrowth(before.monthlyListeners, after.monthlyListeners)}% in Monthly
					Listeners
				</p>
			</div>
		</div>
	);
}

'use client';

import type { IconKey } from '@barely/ui/icon';
import { cn } from '@barely/utils';

import { Icon } from '@barely/ui/icon';

interface MetricData {
	monthlyListeners: number;
	monthlyStreams: number;
	totalFollowers: number;
	totalEmailSubscribers: number;
	monthlyRevenue: string;
	totalInstagramFollowers?: number;
	totalTikTokFollowers?: number;
	totalYouTubeSubscribers?: number;
	totalPatreonMembers?: number;
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
			label: 'Monthly Streams',
			iconName: 'music',
			iconColor: 'text-blue-500',
			before: before.monthlyStreams.toLocaleString(),
			after: after.monthlyStreams.toLocaleString(),
			growth: calculateGrowth(before.monthlyStreams, after.monthlyStreams),
		},
		{
			label: 'Spotify Followers',
			iconName: 'users',
			iconColor: 'text-pink-500',
			before: before.totalFollowers.toLocaleString(),
			after: after.totalFollowers.toLocaleString(),
			growth: calculateGrowth(before.totalFollowers, after.totalFollowers),
		},
		{
			label: 'Email Subscribers',
			iconName: 'email',
			iconColor: 'text-green-500',
			before: before.totalEmailSubscribers.toLocaleString(),
			after: after.totalEmailSubscribers.toLocaleString(),
			growth: calculateGrowth(before.totalEmailSubscribers, after.totalEmailSubscribers),
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
	if (
		before.totalInstagramFollowers !== undefined &&
		after.totalInstagramFollowers !== undefined
	) {
		metrics.push({
			label: 'Instagram Followers',
			iconName: 'instagram',
			iconColor: 'text-pink-500',
			before: before.totalInstagramFollowers.toLocaleString(),
			after: after.totalInstagramFollowers.toLocaleString(),
			growth: calculateGrowth(
				before.totalInstagramFollowers,
				after.totalInstagramFollowers,
			),
		});
	}

	if (
		before.totalTikTokFollowers !== undefined &&
		after.totalTikTokFollowers !== undefined
	) {
		metrics.push({
			label: 'TikTok Followers',
			iconName: 'tiktok',
			iconColor: 'text-white',
			before: before.totalTikTokFollowers.toLocaleString(),
			after: after.totalTikTokFollowers.toLocaleString(),
			growth: calculateGrowth(before.totalTikTokFollowers, after.totalTikTokFollowers),
		});
	}

	if (
		before.totalYouTubeSubscribers !== undefined &&
		after.totalYouTubeSubscribers !== undefined
	) {
		metrics.push({
			label: 'YouTube Subscribers',
			iconName: 'youtube',
			iconColor: 'text-red-500',
			before: before.totalYouTubeSubscribers.toLocaleString(),
			after: after.totalYouTubeSubscribers.toLocaleString(),
			growth: calculateGrowth(
				before.totalYouTubeSubscribers,
				after.totalYouTubeSubscribers,
			),
		});
	}

	if (
		before.totalPatreonMembers !== undefined &&
		after.totalPatreonMembers !== undefined
	) {
		metrics.push({
			label: 'Patreon Supporters',
			iconName: 'heart',
			iconColor: 'text-orange-500',
			before: before.totalPatreonMembers.toLocaleString(),
			after: after.totalPatreonMembers.toLocaleString(),
			growth: calculateGrowth(before.totalPatreonMembers, after.totalPatreonMembers),
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

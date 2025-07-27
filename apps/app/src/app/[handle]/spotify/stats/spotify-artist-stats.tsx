'use client';

import { useState } from 'react';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/server/api/react';
import { Card } from '@barely/ui/elements/card';
import { AreaChart } from '@barely/ui/charts/area-chart';
import { H, Text } from '@barely/ui/elements/typography';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@barely/ui/elements/select';
import { Icon } from '@barely/ui/elements/icon';
import { cn } from '@barely/lib/utils/cn';
import { nFormatter } from '@barely/utils/number';

export function SpotifyArtistStats() {
	const { workspace } = useWorkspace();
	const [dateRange, setDateRange] = useState<'1d' | '1w' | '28d' | '1y'>('28d');

	const { data: timeseries } = api.stat.spotifyArtistTimeseries.useQuery({
		dateRange,
	});

	if (!workspace.spotifyArtistId) {
		return (
			<Card className='p-8'>
				<div className='flex flex-col items-center justify-center space-y-4 text-center'>
					<Icon.spotify className='h-12 w-12 text-muted-foreground' />
					<div>
						<H size='4'>No Spotify Artist Connected</H>
						<Text variant='sm/normal' className='text-muted-foreground'>
							Connect your Spotify artist account in settings to view stats
						</Text>
					</div>
				</div>
			</Card>
		);
	}

	const formatTimestamp = (timestamp: Date) => {
		if (dateRange === '1d') {
			return timestamp.toLocaleTimeString('en-US', {
				hour: 'numeric',
				minute: '2-digit',
			});
		} else if (dateRange === '1w') {
			return timestamp.toLocaleDateString('en-US', {
				weekday: 'short',
				month: 'numeric',
				day: 'numeric',
			});
		} else {
			return timestamp.toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
			});
		}
	};

	const chartData = (timeseries ?? []).map(row => ({
		date: formatTimestamp(row.timestamp),
		followers: row.spotifyFollowers,
		popularity: row.spotifyPopularity,
	}));

	const currentStats = timeseries?.[timeseries.length - 1];
	const previousStats = timeseries?.[0];

	const followerChange = (currentStats?.spotifyFollowers ?? 0) - (previousStats?.spotifyFollowers ?? 0);
	const popularityChange = (currentStats?.spotifyPopularity ?? 0) - (previousStats?.spotifyPopularity ?? 0);

	return (
		<Card className='p-6'>
			<div className='space-y-6'>
				<div className='flex items-center justify-between'>
					<div>
						<H size='4'>Artist Overview</H>
						<Text variant='sm/normal' className='text-muted-foreground'>
							Spotify Artist ID: {workspace.spotifyArtistId}
						</Text>
					</div>
					<Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
						<SelectTrigger className='w-32'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='1d'>Last 24h</SelectItem>
							<SelectItem value='1w'>Last 7 days</SelectItem>
							<SelectItem value='28d'>Last 28 days</SelectItem>
							<SelectItem value='1y'>Last year</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
					<div>
						<div className='mb-4'>
							<Text variant='sm/medium' className='text-muted-foreground'>
								Followers
							</Text>
							<div className='flex items-baseline gap-2'>
								<Text variant='2xl/semibold'>
									{nFormatter(currentStats?.spotifyFollowers ?? 0)}
								</Text>
								<Text
									variant='sm/medium'
									className={cn(
										'flex items-center',
										followerChange > 0 ? 'text-green-600' : 
										followerChange < 0 ? 'text-red-600' : 'text-gray-500'
									)}
								>
									{followerChange > 0 && '+'}
									{nFormatter(followerChange)}
								</Text>
							</div>
						</div>
						<AreaChart
							className='h-48'
							data={chartData}
							index='date'
							categories={['followers']}
							colors={['green']}
							showXAxis={false}
							showLegend={false}
							curveType='natural'
							showGridLines={false}
							showYAxis={false}
							valueFormatter={v => nFormatter(v)}
						/>
					</div>

					<div>
						<div className='mb-4'>
							<Text variant='sm/medium' className='text-muted-foreground'>
								Popularity
							</Text>
							<div className='flex items-baseline gap-2'>
								<Text variant='2xl/semibold'>
									{currentStats?.spotifyPopularity ?? 0}
								</Text>
								<Text
									variant='sm/medium'
									className={cn(
										'flex items-center',
										popularityChange > 0 ? 'text-green-600' : 
										popularityChange < 0 ? 'text-red-600' : 'text-gray-500'
									)}
								>
									{popularityChange > 0 && '+'}
									{popularityChange}
								</Text>
							</div>
						</div>
						<AreaChart
							className='h-48'
							data={chartData}
							index='date'
							categories={['popularity']}
							colors={['blue']}
							showXAxis={false}
							showLegend={false}
							curveType='natural'
							showGridLines={false}
							showYAxis={false}
							valueFormatter={v => v.toString()}
							minValue={0}
							maxValue={100}
						/>
					</div>
				</div>
			</div>
		</Card>
	);
}
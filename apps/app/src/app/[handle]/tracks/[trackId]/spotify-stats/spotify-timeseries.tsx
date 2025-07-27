'use client';

import { useState } from 'react';
import { api } from '@barely/server/api/react';
import { Card } from '@barely/ui/elements/card';
import { AreaChart } from '@barely/ui/charts/area-chart';
import { H, Text } from '@barely/ui/elements/typography';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@barely/ui/elements/select';
import { cn } from '@barely/lib/utils/cn';
import { nFormatter } from '@barely/utils/number';

interface SpotifyTimeseriesProps {
	trackId: string;
}

export function SpotifyTimeseries({ trackId }: SpotifyTimeseriesProps) {
	const [dateRange, setDateRange] = useState<'1d' | '1w' | '28d' | '1y'>('28d');

	const { data: timeseries } = api.stat.spotifyTrackTimeseries.useQuery({
		trackId,
		dateRange,
	});

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
		popularity: row.spotifyPopularity,
	}));

	const currentPopularity = timeseries?.[timeseries.length - 1]?.spotifyPopularity ?? 0;
	const previousPopularity = timeseries?.[0]?.spotifyPopularity ?? 0;
	const popularityChange = currentPopularity - previousPopularity;

	return (
		<Card className='p-6'>
			<div className='flex flex-col space-y-4'>
				<div className='flex items-center justify-between'>
					<div>
						<H size='4'>Popularity Over Time</H>
						<div className='flex items-baseline gap-2'>
							<Text variant='2xl/semibold'>{currentPopularity}</Text>
							<Text
								variant='sm/medium'
								className={cn(
									'flex items-center',
									popularityChange > 0 ? 'text-green-600' : 
									popularityChange < 0 ? 'text-red-600' : 'text-gray-500'
								)}
							>
								{popularityChange > 0 && '+'}
								{popularityChange} from {dateRange === '1d' ? 'yesterday' : 
								dateRange === '1w' ? 'last week' : 
								dateRange === '28d' ? '28 days ago' : 'last year'}
							</Text>
						</div>
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

				<AreaChart
					className='h-72'
					data={chartData}
					index='date'
					categories={['popularity']}
					colors={['green']}
					showXAxis={true}
					showLegend={false}
					curveType='natural'
					yAxisWidth={30}
					valueFormatter={v => v.toString()}
					minValue={0}
					maxValue={100}
				/>
			</div>
		</Card>
	);
}
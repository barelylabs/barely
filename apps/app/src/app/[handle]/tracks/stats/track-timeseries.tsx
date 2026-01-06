'use client';

import type { AppRouterOutputs } from '@barely/lib/trpc/app.route';
import { useMemo } from 'react';
import {
	useFormatTimestamp,
	useTrackStatSearchParams,
	useWorkspace,
} from '@barely/hooks';
import { nFormatter, raise } from '@barely/utils';
import { useSuspenseQuery } from '@tanstack/react-query';
import { LineChart } from '@tremor/react';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Card } from '@barely/ui/card';
import { AreaChart } from '@barely/ui/charts/area-chart';
import { Icon } from '@barely/ui/icon';
import { H, Text } from '@barely/ui/typography';

type TrackTimeSeries = AppRouterOutputs['stat']['spotifyTrackTimeseries'];

export function TrackTimeseries() {
	const { handle } = useWorkspace();
	const { filters, selectedIds } = useTrackStatSearchParams();
	const { formatTimestamp } = useFormatTimestamp(filters.dateRange);

	const { dateRange } = filters;
	const trackIds = selectedIds ?? [];

	const trpc = useTRPC();

	// Always call hooks, even if we won't use the data
	const shouldFetchData = Array.isArray(trackIds) && trackIds.length > 0;

	const { data: rawData } = useSuspenseQuery({
		...trpc.stat.spotifyTrackTimeseries.queryOptions({
			handle,
			dateRange: dateRange ?? '28d',
			trackIds: shouldFetchData ? trackIds : [],
		}),
	});

	// Group data by track
	const trackData = useMemo(() => {
		if (!shouldFetchData) return [];

		const grouped = new Map<
			string,
			{
				trackId: string;
				trackName: string;
				timeseries: TrackTimeSeries;
				previousPeriod?: TrackTimeSeries[0];
			}
		>();

		rawData.forEach(row => {
			const trackId = row.trackId || 'unknown';
			const trackName = row.trackName || 'Unknown Track';

			if (!grouped.has(trackId)) {
				grouped.set(trackId, {
					trackId,
					trackName,
					timeseries: [],
				});
			}

			const track = grouped.get(trackId);

			if (row.resultType === 'timeseries') {
				track?.timeseries.push(row);
			} else {
				if (!track) return;
				track.previousPeriod = row;
			}
		});

		return Array.from(grouped.values());
	}, [rawData, shouldFetchData]);

	// If no tracks selected, show empty state
	if (!shouldFetchData) {
		return (
			<Card className='p-6'>
				<div className='flex h-72 items-center justify-center'>
					<Text variant='sm/normal' className='text-muted-foreground'>
						Select tracks to view popularity data
					</Text>
				</div>
			</Card>
		);
	}

	// If single track selected, show detailed stats
	if (trackData.length === 1 && trackData[0]) {
		return (
			<SingleTrackStats trackData={trackData[0]} formatTimestamp={formatTimestamp} />
		);
	}

	// Multiple tracks - show comparison chart
	return <MultiTrackComparison trackData={trackData} formatTimestamp={formatTimestamp} />;
}

function SingleTrackStats({
	trackData,
	formatTimestamp,
}: {
	trackData: {
		trackId: string;
		trackName: string;
		timeseries: TrackTimeSeries;
		previousPeriod?: TrackTimeSeries[0];
	};
	formatTimestamp: (timestamp: string) => string;
}) {
	const { timeseries } = trackData;

	// Process timeseries data
	const processedTimeseries = timeseries
		.filter(row => row.timestamp)
		.map(row => ({
			...row,
			date: formatTimestamp(row.timestamp ?? raise('timestamp is required')),
		}))
		.sort(
			(a, b) =>
				new Date(a.timestamp ?? '').getTime() - new Date(b.timestamp ?? '').getTime(),
		);

	// Calculate stats
	const validPopularities = timeseries
		.map(row => row.spotifyPopularity)
		.filter((pop): pop is number => pop !== null);

	// const latestPopularity =
	// 	timeseries.find(row => row.spotifyPopularity !== null)?.spotifyPopularity ?? null;

	// const avgPopularity =
	// 	validPopularities.length > 0 ?
	// 		Math.round(
	// 			validPopularities.reduce((acc, pop) => acc + pop, 0) / validPopularities.length,
	// 		)
	// 	:	null;
	const maxPopularity =
		validPopularities.length > 0 ? Math.max(...validPopularities) : null;
	// const minPopularity =
	// 	validPopularities.length > 0 ? Math.min(...validPopularities) : null;

	// const previousPeriodAvg = previousPeriod?.avgSpotifyPopularity ?? null;

	const chartData = processedTimeseries.map(row => ({
		date: row.date,
		popularity: row.spotifyPopularity,
	}));

	return (
		<Card className='p-6'>
			<div className='flex flex-col gap-4'>
				<div className='flex items-center gap-2'>
					<Icon.spotify className='h-6 w-6 text-spotify' />
					<H size='4'>Spotify Popularity</H>
				</div>

				<AreaChart
					className='mt-4 h-72'
					data={chartData}
					index='date'
					categories={['popularity']}
					colors={['green']}
					showXAxis={true}
					showLegend={false}
					curveType='linear'
					yAxisWidth={30}
					valueFormatter={v => nFormatter(v)}
					minValue={0}
					maxValue={maxPopularity ? Math.ceil((maxPopularity * 1.1) / 10) * 10 : 100}
					showAnimation={true}
					animationDuration={500}
				/>
			</div>
		</Card>
	);
}

function MultiTrackComparison({
	trackData,
	formatTimestamp,
}: {
	trackData: {
		trackId: string;
		trackName: string;
		timeseries: TrackTimeSeries;
		previousPeriod?: TrackTimeSeries[0];
	}[];
	formatTimestamp: (timestamp: string) => string;
}) {
	// Create a unified date range across all tracks and calculate max value
	const { chartData, maxValue } = useMemo(() => {
		const dateMap = new Map<
			string,
			{ date: string; timestamp: string; [key: string]: number | string }
		>();
		let max = 0;

		// Get all unique dates
		trackData.forEach(track => {
			track.timeseries.forEach(row => {
				if (row.timestamp) {
					const date = formatTimestamp(row.timestamp);
					if (!dateMap.has(date)) {
						dateMap.set(date, { date, timestamp: row.timestamp });
					}
				}
			});
		});

		// Add track data to each date and track maximum value
		trackData.forEach(track => {
			const trackKey = track.trackName.replace(/[^a-zA-Z0-9]/g, '_');
			track.timeseries.forEach(row => {
				if (row.timestamp) {
					const date = formatTimestamp(row.timestamp);
					const dateEntry = dateMap.get(date);
					if (dateEntry) {
						if (row.spotifyPopularity !== null) {
							dateEntry[trackKey] = row.spotifyPopularity;
							if (row.spotifyPopularity > max) {
								max = row.spotifyPopularity;
							}
						}
					}
				}
			});
		});

		const sortedData = Array.from(dateMap.values()).sort(
			(a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
		);

		// Calculate a nice rounded max value with some padding
		const calculatedMaxValue = max > 0 ? Math.ceil((max * 1.1) / 10) * 10 : 100;

		return { chartData: sortedData, maxValue: calculatedMaxValue };
	}, [trackData, formatTimestamp]);

	const categories = trackData.map(t => t.trackName.replace(/[^a-zA-Z0-9]/g, '_'));
	const colors = ['blue', 'red', 'green', 'purple', 'orange', 'pink', 'cyan', 'yellow'];

	return (
		<Card className='p-6'>
			<div className='flex flex-col gap-4'>
				<div className='flex items-center gap-2'>
					<Icon.spotify className='h-6 w-6 text-spotify' />
					<H size='4'>Spotify Popularity</H>
				</div>

				<LineChart
					className='mt-4 h-72'
					data={chartData}
					index='date'
					categories={categories}
					colors={colors.slice(0, categories.length)}
					showXAxis={true}
					showLegend={true}
					curveType='linear'
					yAxisWidth={30}
					valueFormatter={v => nFormatter(v)}
					minValue={0}
					maxValue={maxValue}
					showAnimation={true}
					animationDuration={500}
				/>
			</div>
		</Card>
	);
}

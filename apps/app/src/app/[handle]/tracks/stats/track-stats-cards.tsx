'use client';

import { useMemo } from 'react';
import { useTrackStatSearchParams, useWorkspace } from '@barely/hooks';
import { cn } from '@barely/utils';
import { useSuspenseQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Card } from '@barely/ui/card';
import { Icon } from '@barely/ui/icon';
import { H, Text } from '@barely/ui/typography';

export function TrackStatsCards() {
	const { handle } = useWorkspace();
	const { filters, selectedIds } = useTrackStatSearchParams();
	const { dateRange } = filters;
	const trackIds = selectedIds ?? [];

	const trpc = useTRPC();

	// Fetch track details
	const { data: tracks } = useSuspenseQuery(
		trpc.track.byWorkspace.queryOptions({
			handle,
			// ids: Array.isArray(trackIds) ? trackIds : [],
		}),
	);

	// Fetch stats data
	const { data: statsData } = useSuspenseQuery(
		trpc.stat.spotifyTrackTimeseries.queryOptions({
			handle,
			dateRange: dateRange ?? '28d',
			trackIds: Array.isArray(trackIds) ? trackIds : [],
		}),
	);

	// Calculate aggregated stats
	const stats = useMemo(() => {
		// If no tracks selected, return nulls
		if (trackIds.length === 0) {
			return {
				currentAvg: null,
				currentMax: null,
				currentMin: null,
				latestByTrack: new Map<string, number>(),
				trend: null,
			};
		}

		const currentPeriodData = statsData.filter(row => row.resultType === 'timeseries');
		const previousPeriodData = statsData.filter(
			row => row.resultType === 'previousPeriod',
		);

		// Current period stats
		const validPopularities = currentPeriodData
			.map(row => row.spotifyPopularity)
			.filter((pop): pop is number => pop !== null);

		const currentAvg =
			validPopularities.length > 0 ?
				Math.round(
					validPopularities.reduce((acc, pop) => acc + pop, 0) / validPopularities.length,
				)
			:	null;

		const currentMax =
			validPopularities.length > 0 ? Math.max(...validPopularities) : null;

		const currentMin =
			validPopularities.length > 0 ? Math.min(...validPopularities) : null;

		// Latest values for each track
		const latestByTrack = new Map<string, number>();
		currentPeriodData.forEach(row => {
			if (row.trackId && row.spotifyPopularity !== null) {
				latestByTrack.set(row.trackId, row.spotifyPopularity);
			}
		});

		// Previous period average
		const previousAvg =
			previousPeriodData.length > 0 && previousPeriodData[0]?.avgSpotifyPopularity ?
				previousPeriodData[0].avgSpotifyPopularity
			:	null;

		// Calculate trend
		let trend = null;
		if (currentAvg !== null && previousAvg !== null && previousAvg > 0) {
			trend = Math.round(((currentAvg - previousAvg) / previousAvg) * 100);
		}

		return {
			currentAvg,
			currentMax,
			currentMin,
			latestByTrack,
			trend,
		};
	}, [statsData, trackIds.length]);

	const selectedTracks = tracks.tracks.filter(
		t => Array.isArray(trackIds) && trackIds.includes(t.id),
	);

	return (
		<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
			{/* Selected Tracks Card */}
			<Card className='group relative overflow-hidden p-4 transition-all hover:shadow-md'>
				<div className='absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-spotify to-green-600' />
				<div className='flex items-start justify-between'>
					<div className='flex-1'>
						<Text variant='sm/medium' className='text-muted-foreground'>
							Selected Tracks
						</Text>
						<H size='3' className='mt-1'>
							{selectedTracks.length}
						</H>
						{selectedTracks.length > 0 && (
							<Text variant='xs/medium' className='mt-1 text-muted-foreground'>
								{selectedTracks.length === 1 ? 'track' : 'tracks'} selected
							</Text>
						)}
					</div>
					<div className='rounded-md bg-spotify/10 p-2 transition-transform group-hover:scale-110'>
						<Icon.music className='h-4 w-4 text-spotify' />
					</div>
				</div>
			</Card>

			{/* Average Popularity Card */}
			<Card className='group relative overflow-hidden p-4 transition-all hover:shadow-md'>
				<div className='absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600' />
				<div className='flex items-start justify-between'>
					<div>
						<Text variant='sm/medium' className='text-muted-foreground'>
							Average Popularity
						</Text>
						<H size='3' className='mt-1'>
							{stats.currentAvg ?? '-'}
						</H>
						{stats.currentAvg !== null && (
							<Text variant='xs/medium' className='mt-1 text-muted-foreground'>
								out of 100
							</Text>
						)}
					</div>
					<div className='rounded-md bg-blue-100 p-2 transition-transform group-hover:scale-110'>
						<Icon.lineChart className='h-4 w-4 text-blue-600' />
					</div>
				</div>
			</Card>

			{/* Peak Popularity Card */}
			<Card className='group relative overflow-hidden p-4 transition-all hover:shadow-md'>
				<div className='absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-500 to-green-600' />
				<div className='flex items-start justify-between'>
					<div>
						<Text variant='sm/medium' className='text-muted-foreground'>
							Peak Popularity
						</Text>
						<H size='3' className='mt-1'>
							{stats.currentMax ?? '-'}
						</H>
						{stats.currentMax !== null && (
							<Text variant='xs/medium' className='mt-1 text-muted-foreground'>
								highest achieved
							</Text>
						)}
					</div>
					<div className='rounded-md bg-green-100 p-2 transition-transform group-hover:scale-110'>
						<Icon.star className='h-4 w-4 text-green-600' />
					</div>
				</div>
			</Card>

			{/* Trend Card */}
			<Card className='group relative overflow-hidden p-4 transition-all hover:shadow-md'>
				<div
					className={cn(
						'absolute inset-x-0 top-0 h-1 bg-gradient-to-r',
						stats.trend !== null && stats.trend > 0 ?
							'from-green-500 to-green-600'
						:	'from-red-500 to-red-600',
					)}
				/>
				<div className='flex items-start justify-between'>
					<div>
						<Text variant='sm/medium' className='text-muted-foreground'>
							vs Previous Period
						</Text>
						<div className='mt-1 flex items-baseline gap-1'>
							<H
								size='3'
								className={cn(
									stats.trend !== null &&
										(stats.trend > 0 ? 'text-green-600' : 'text-red-600'),
								)}
							>
								{stats.trend !== null ?
									<>
										{stats.trend > 0 ? '+' : ''}
										{stats.trend}%
									</>
								:	'-'}
							</H>
							{stats.trend !== null && (
								<Icon.arrowUp
									className={cn(
										'h-4 w-4',
										stats.trend > 0 ? 'text-green-600' : 'rotate-180 text-red-600',
									)}
								/>
							)}
						</div>
						{stats.trend !== null && (
							<Text variant='xs/medium' className='mt-1 text-muted-foreground'>
								{Math.abs(stats.trend) < 1 ?
									'stable'
								: stats.trend > 0 ?
									'improving'
								:	'declining'}
							</Text>
						)}
					</div>
					<div
						className={cn(
							'rounded-md p-2 transition-transform group-hover:scale-110',
							stats.trend !== null && stats.trend > 0 ? 'bg-green-100' : 'bg-red-100',
						)}
					>
						<Icon.chart
							className={cn(
								'h-4 w-4',
								stats.trend !== null && stats.trend > 0 ?
									'text-green-600'
								:	'text-red-600',
							)}
						/>
					</div>
				</div>
			</Card>
		</div>
	);
}

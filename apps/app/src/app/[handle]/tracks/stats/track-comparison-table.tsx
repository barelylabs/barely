'use client';

import { useMemo } from 'react';
import { useTrackStatSearchParams, useWorkspace } from '@barely/hooks';
import { cn } from '@barely/utils';
import { useSuspenseQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Badge } from '@barely/ui/badge';
import { Card } from '@barely/ui/card';
import { Icon } from '@barely/ui/icon';
import { Img } from '@barely/ui/img';
import { Text } from '@barely/ui/typography';

export function TrackComparisonTable() {
	const { handle } = useWorkspace();
	const { filters, selectedIds } = useTrackStatSearchParams();
	const { dateRange } = filters;
	const trackIds = useMemo(() => selectedIds ?? [], [selectedIds]);

	const trpc = useTRPC();

	// Always call hooks
	const hasSelectedTracks = Array.isArray(trackIds) && trackIds.length > 0;

	// Fetch track details for the workspace
	const { data: tracks } = useSuspenseQuery({
		...trpc.track.byWorkspace.queryOptions({
			handle,
			limit: 50, // Get enough tracks to include all selected ones
		}),
	});

	// Fetch stats data
	const { data: statsData } = useSuspenseQuery({
		...trpc.stat.spotifyTrackTimeseries.queryOptions({
			handle,
			dateRange: dateRange ?? '28d',
			trackIds: hasSelectedTracks ? trackIds : [],
		}),
	});

	// Calculate stats per track
	const trackStats = useMemo(() => {
		if (!hasSelectedTracks) return [];

		const statsByTrack = new Map<
			string,
			{
				id: string;
				name: string;
				artworkUrl: string;
				current: number | null;
				average: number | null;
				peak: number | null;
				trend: number | null;
			}
		>();

		// Initialize with track info - only for selected tracks
		const selectedTracks = tracks.tracks.filter(track => trackIds.includes(track.id));

		selectedTracks.forEach(track => {
			statsByTrack.set(track.id, {
				id: track.id,
				name: track.name,
				artworkUrl: track.artworkFiles.find(f => f.current)?.src ?? track.imageUrl ?? '',
				current: null,
				average: null,
				peak: null,
				trend: null,
			});
		});

		// Process timeseries data
		statsData.forEach(row => {
			if (row.trackId && statsByTrack.has(row.trackId)) {
				const track = statsByTrack.get(row.trackId);

				if (row.resultType === 'timeseries' && row.spotifyPopularity !== null) {
					// Update current (latest) value
					if (track && track.current === null) {
						track.current = row.spotifyPopularity;
					}

					// Calculate average
					if (track && track.average === null) {
						const allValues = statsData
							.filter(
								r =>
									r.trackId === row.trackId &&
									r.resultType === 'timeseries' &&
									r.spotifyPopularity !== null,
							)
							.map(r => r.spotifyPopularity)
							.filter((val): val is number => val !== null);

						if (allValues.length > 0) {
							track.average = Math.round(
								allValues.reduce((sum, val) => sum + val, 0) / allValues.length,
							);
							track.peak = Math.max(...allValues);
						}
					}
				} else if (
					row.resultType === 'previousPeriod' &&
					row.avgSpotifyPopularity !== null
				) {
					// Calculate trend
					if (
						track &&
						track.average !== null &&
						row.avgSpotifyPopularity &&
						row.avgSpotifyPopularity > 0
					) {
						track.trend = Math.round(
							((track.average - row.avgSpotifyPopularity) / row.avgSpotifyPopularity) *
								100,
						);
					}
				}
			}
		});

		return Array.from(statsByTrack.values());
	}, [tracks, statsData, trackIds, hasSelectedTracks]);

	// Don't show table if no tracks selected
	if (!hasSelectedTracks) {
		return null;
	}

	return (
		<Card className='overflow-hidden'>
			<div className='overflow-x-auto'>
				<table className='w-full'>
					<thead>
						<tr className='border-b'>
							<th className='px-3 py-2 text-left'>
								<Text variant='sm/medium' className='text-muted-foreground'>
									Track
								</Text>
							</th>
							<th className='px-3 py-2 text-center'>
								<Text variant='sm/medium' className='text-muted-foreground'>
									Current
								</Text>
							</th>
							<th className='px-3 py-2 text-center'>
								<Text variant='sm/medium' className='text-muted-foreground'>
									Average
								</Text>
							</th>
							<th className='px-3 py-2 text-center'>
								<Text variant='sm/medium' className='text-muted-foreground'>
									Peak
								</Text>
							</th>
							<th className='px-3 py-2 text-right'>
								<Text variant='sm/medium' className='text-muted-foreground'>
									Trend
								</Text>
							</th>
						</tr>
					</thead>
					<tbody>
						{trackStats.map((track, index) => (
							<tr
								key={track.id}
								className={cn(
									'border-b transition-colors hover:bg-muted/50',
									index === trackStats.length - 1 && 'border-b-0',
								)}
							>
								<td className='px-3 py-2'>
									<div className='flex items-center gap-2'>
										<Img
											src={track.artworkUrl}
											alt={track.name}
											className='h-6 w-6 rounded bg-gray-100'
											width={24}
											height={24}
										/>
										<Text variant='sm/semibold'>{track.name}</Text>
									</div>
								</td>
								<td className='px-3 py-2 text-center'>
									<Text variant='sm/medium'>{track.current ?? '-'}</Text>
								</td>
								<td className='px-3 py-2 text-center'>
									<Text variant='sm/medium'>{track.average ?? '-'}</Text>
								</td>
								<td className='px-3 py-2 text-center'>
									<Badge variant='secondary' className='gap-1 px-2 py-0.5'>
										<Icon.star className='h-3 w-3' />
										{track.peak ?? '-'}
									</Badge>
								</td>
								<td className='px-3 py-2'>
									<div className='flex items-center justify-end gap-1'>
										{track.trend !== null ?
											<>
												<Text
													variant='sm/medium'
													className={cn(
														track.trend > 0 ? 'text-green-600' : 'text-red-600',
													)}
												>
													{track.trend > 0 ? '+' : ''}
													{track.trend}%
												</Text>
												<Icon.arrowUp
													className={cn(
														'h-3 w-3',
														track.trend > 0 ?
															'text-green-600'
														:	'rotate-180 text-red-600',
													)}
												/>
											</>
										:	<Text variant='sm/medium' className='text-muted-foreground'>
												-
											</Text>
										}
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</Card>
	);
}

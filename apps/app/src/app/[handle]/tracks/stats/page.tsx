import type { trackStatFiltersSchema } from '@barely/validators';
import type { z } from 'zod/v4';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';

import { ComparisonTableSkeleton } from '@barely/ui/components/comparison-table-skeleton';
import { StatsCardsSkeleton } from '@barely/ui/components/stats-cards-skeleton';
import { TimeseriesSkeleton } from '@barely/ui/components/timeseries-skeleton';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { TrackComparisonTable } from '~/app/[handle]/tracks/stats/track-comparison-table';
import { TrackStatHeader } from '~/app/[handle]/tracks/stats/track-stat-header';
import { TrackStatsCards } from '~/app/[handle]/tracks/stats/track-stats-cards';
import { TrackTimeseries } from '~/app/[handle]/tracks/stats/track-timeseries';
import { HydrateClient, prefetch, trpc, trpcCaller } from '~/trpc/server';

export default async function TrackStatsPage({
	params,
	searchParams,
}: {
	params: Promise<{ handle: string }>;
	searchParams: Promise<z.infer<typeof trackStatFiltersSchema>>;
}) {
	const { handle } = await params;
	const resolvedSearchParams = await searchParams;

	// Check if workspace has any tracks
	const tracks = await trpcCaller.track.byWorkspace({ handle, limit: 1 });
	if (tracks.tracks.length === 0) {
		redirect(`/${handle}/tracks`);
	}

	// Prefetch track data and stats
	const dateRange =
		typeof resolvedSearchParams.dateRange === 'string' ?
			resolvedSearchParams.dateRange
		:	'28d';
	const trackIds =
		resolvedSearchParams.trackIds ?
			Array.isArray(resolvedSearchParams.trackIds) ?
				resolvedSearchParams.trackIds
			:	[resolvedSearchParams.trackIds]
		:	[];

	// Prefetch all tracks for the selector
	prefetch(
		trpc.track.byWorkspace.queryOptions({
			handle,
			search: '',
		}),
	);

	// If we have selected tracks, prefetch their stats
	if (trackIds.length > 0) {
		prefetch(
			trpc.stat.spotifyTrackTimeseries.queryOptions({
				handle,
				dateRange,
				trackIds,
			}),
		);
	}

	return (
		<HydrateClient>
			<DashContentHeader title='Track Stats' />
			<div className='flex flex-col gap-6'>
				{/* Unified filter bar */}
				{/* <Card className='p-4'>
					<div className='flex flex-row items-center gap-4'>
						<div className='flex-1'>
							<TrackSelector />
						</div>
					</div>
				</Card> */}
				<TrackStatHeader />

				{/* Stats cards - always visible */}
				<Suspense fallback={<StatsCardsSkeleton />}>
					<TrackStatsCards />
				</Suspense>

				{/* Chart area */}
				<Suspense fallback={<TimeseriesSkeleton />}>
					<TrackTimeseries />
				</Suspense>

				{/* Comparison table - visible for multiple tracks */}
				<Suspense fallback={<ComparisonTableSkeleton />}>
					<TrackComparisonTable />
				</Suspense>
			</div>
		</HydrateClient>
	);
}

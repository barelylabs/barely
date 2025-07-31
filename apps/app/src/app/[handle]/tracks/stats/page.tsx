import { Suspense } from 'react';
import { redirect } from 'next/navigation';

import { Card } from '@barely/ui/card';
import { Skeleton } from '@barely/ui/skeleton';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { TrackComparisonTable } from '~/app/[handle]/tracks/stats/track-comparison-table';
import { TrackSelector } from '~/app/[handle]/tracks/stats/track-selector';
import { TrackStatHeader } from '~/app/[handle]/tracks/stats/track-stat-header';
import { TrackStatsCards } from '~/app/[handle]/tracks/stats/track-stats-cards';
import { TrackTimeseries } from '~/app/[handle]/tracks/stats/track-timeseries';
import { HydrateClient, trpcCaller } from '~/trpc/server';

export default async function TrackStatsPage({
	params,
}: {
	params: Promise<{ handle: string }>;
}) {
	const { handle } = await params;

	// Check if workspace has any tracks
	const tracks = await trpcCaller.track.byWorkspace({ handle, limit: 1 });
	if (tracks.tracks.length === 0) {
		redirect(`/${handle}/tracks`);
	}

	//fixme prefetch

	return (
		<HydrateClient>
			<DashContentHeader title='Track Stats' />
			<div className='flex flex-col gap-6'>
				{/* Unified filter bar */}
				<Card className='p-4'>
					<div className='flex flex-row items-center gap-4'>
						<div className='flex-1'>
							<TrackSelector />
						</div>
						<TrackStatHeader />
					</div>
				</Card>

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

function TimeseriesSkeleton() {
	return (
		<Card className='p-6'>
			<div className='flex flex-col gap-4'>
				<div className='flex flex-row items-center justify-between'>
					<Skeleton className='h-16 w-48' />
					<div className='flex flex-row gap-6'>
						{[1, 2, 3, 4].map(i => (
							<Skeleton key={i} className='h-12 w-20' />
						))}
					</div>
				</div>
				<Skeleton className='h-72 w-full' />
			</div>
		</Card>
	);
}

function StatsCardsSkeleton() {
	return (
		<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
			{[1, 2, 3, 4].map(i => (
				<Card key={i} className='p-4'>
					<Skeleton className='mb-2 h-4 w-24' />
					<Skeleton className='h-8 w-32' />
				</Card>
			))}
		</div>
	);
}

function ComparisonTableSkeleton() {
	return (
		<Card className='overflow-hidden'>
			<div className='p-4'>
				<Skeleton className='h-6 w-40' />
			</div>
			<div className='border-t'>
				<div className='p-4'>
					{[1, 2, 3].map(i => (
						<div key={i} className='flex items-center gap-4 py-3'>
							<Skeleton className='h-4 w-32' />
							<Skeleton className='h-4 w-12 flex-1' />
							<Skeleton className='h-4 w-12' />
							<Skeleton className='h-4 w-12' />
							<Skeleton className='h-4 w-16' />
						</div>
					))}
				</div>
			</div>
		</Card>
	);
}

import { Suspense } from 'react';

import { H } from '@barely/ui/typography';

import { HydrateClient, prefetch, trpc } from '~/trpc/server';
import { AdminOverviewCharts } from './_components/admin-overview-charts';
import { AdminOverviewStats } from './_components/admin-overview-stats';

export default function AdminOverviewPage() {
	prefetch(trpc.admin.overview.queryOptions());
	prefetch(trpc.admin.userGrowth.queryOptions({}));
	prefetch(trpc.admin.workspacesByPlan.queryOptions());
	prefetch(trpc.admin.topWorkspaces.queryOptions({ sortBy: 'events', limit: 10 }));
	prefetch(trpc.admin.revenueTimeseries.queryOptions({}));

	return (
		<HydrateClient>
			<div className='flex flex-col gap-6'>
				<H size='5'>Platform Overview</H>

				<Suspense
					fallback={
						<div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'>
							{Array.from({ length: 7 }).map((_, i) => (
								<div
									key={i}
									className='h-24 animate-pulse rounded-md border-2 bg-muted'
								/>
							))}
						</div>
					}
				>
					<AdminOverviewStats />
				</Suspense>

				<Suspense
					fallback={
						<div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
							{Array.from({ length: 4 }).map((_, i) => (
								<div
									key={i}
									className='h-64 animate-pulse rounded-md border-2 bg-muted'
								/>
							))}
						</div>
					}
				>
					<AdminOverviewCharts />
				</Suspense>
			</div>
		</HydrateClient>
	);
}

import type { z } from 'zod/v4';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { vipStatFiltersSchema } from '@barely/validators';

import { StatsCardsSkeleton } from '@barely/ui/components/stats-cards-skeleton';
import { TimeseriesSkeleton } from '@barely/ui/components/timeseries-skeleton';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { StatBarelyReferers } from '~/app/[handle]/_components/stat-barely-referers';
import { StatDevices } from '~/app/[handle]/_components/stat-devices';
import { StatExternalReferers } from '~/app/[handle]/_components/stat-external-referers';
import { StatLocations } from '~/app/[handle]/_components/stat-locations';
import { VipStatHeader } from '~/app/[handle]/vip/swaps/stats/vip-stat-header';
import { VipTimeseries } from '~/app/[handle]/vip/swaps/stats/vip-timeseries';
import { HydrateClient, prefetch, trpc } from '~/trpc/server';

export default async function VipStatsPage({
	params,
	searchParams,
}: {
	params: Promise<{ handle: string }>;
	searchParams: Promise<z.infer<typeof vipStatFiltersSchema>>;
}) {
	const { handle } = await params;
	const filters = await searchParams;

	const parsedFilters = vipStatFiltersSchema.safeParse(filters);

	if (!parsedFilters.success) {
		console.log('parsedFilters error', parsedFilters.error);
		redirect(`/${handle}/vip/stats`);
	}

	prefetch(trpc.stat.vipTimeseries.queryOptions({ handle, ...parsedFilters.data }));
	prefetch(
		trpc.vipSwap.byWorkspace.queryOptions({
			handle,
			...parsedFilters.data,
		}),
	);

	return (
		<HydrateClient>
			<DashContentHeader title='VIP Stats' />
			{/* Unified filter bar */}
			{/* <Card className='p-4'>
				<div className='flex flex-row items-center gap-4'>
					<VipSwapSelector />
				</div>
			</Card> */}
			<VipStatHeader />

			<Suspense fallback={<TimeseriesSkeleton />}>
				<VipTimeseries />
			</Suspense>

			<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
				<Suspense fallback={<StatsCardsSkeleton />}>
					<StatLocations eventType='vip/view' />
					<StatDevices eventType='vip/view' />
					<StatExternalReferers eventType='vip/view' />
					<StatBarelyReferers eventType='vip/view' />
				</Suspense>
			</div>
		</HydrateClient>
	);
}

import type { z } from 'zod/v4';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { bioStatFiltersSchema } from '@barely/validators';

import { StatsCardsSkeleton } from '@barely/ui/components/stats-cards-skeleton';
import { TimeseriesSkeleton } from '@barely/ui/components/timeseries-skeleton';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { StatBarelyReferers } from '~/app/[handle]/_components/stat-barely-referers';
import { StatDevices } from '~/app/[handle]/_components/stat-devices';
import { StatExternalReferers } from '~/app/[handle]/_components/stat-external-referers';
import { StatLocations } from '~/app/[handle]/_components/stat-locations';
import { BioButtonStats } from '~/app/[handle]/bio/stats/bio-button-stats';
import { BioConversionFunnel } from '~/app/[handle]/bio/stats/bio-conversion-funnel';
import { BioEngagementScore } from '~/app/[handle]/bio/stats/bio-engagement-score';
import { BioStatHeader } from '~/app/[handle]/bio/stats/bio-stat-header';
import { BioTimeseries } from '~/app/[handle]/bio/stats/bio-timeseries';
import { HydrateClient, prefetch, trpc } from '~/trpc/server';

export default async function BioStatsPage({
	params,
	searchParams,
}: {
	params: Promise<{ handle: string }>;
	searchParams: Promise<z.infer<typeof bioStatFiltersSchema>>;
}) {
	const { handle } = await params;
	const filters = await searchParams;

	const parsedFilters = bioStatFiltersSchema.safeParse(filters);

	if (!parsedFilters.success) {
		redirect(`/${handle}/bio/stats`);
	}

	prefetch(trpc.stat.bioTimeseries.queryOptions({ handle, ...parsedFilters.data }));
	prefetch(trpc.stat.bioButtonStats.queryOptions({ handle, ...parsedFilters.data }));
	prefetch(trpc.stat.bioConversionFunnel.queryOptions({ handle, ...parsedFilters.data }));
	prefetch(
		trpc.stat.bioEngagementMetrics.queryOptions({ handle, ...parsedFilters.data }),
	);
	prefetch(
		trpc.bio.byWorkspace.queryOptions({
			handle,
			...parsedFilters.data,
		}),
	);

	return (
		<HydrateClient>
			<DashContentHeader title='Bio Stats' />
			<BioStatHeader />

			<Suspense fallback={<TimeseriesSkeleton />}>
				<BioTimeseries />
			</Suspense>

			<Suspense fallback={<StatsCardsSkeleton />}>
				<BioConversionFunnel />
			</Suspense>

			<Suspense fallback={<StatsCardsSkeleton />}>
				<BioEngagementScore />
			</Suspense>

			<Suspense fallback={<StatsCardsSkeleton />}>
				<BioButtonStats />
			</Suspense>

			<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
				<Suspense fallback={<StatsCardsSkeleton />}>
					<StatLocations eventType='bio/view' />
					<StatDevices eventType='bio/view' />
					<StatExternalReferers eventType='bio/view' />
					<StatBarelyReferers eventType='bio/view' />
				</Suspense>
			</div>
		</HydrateClient>
	);
}

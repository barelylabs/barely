import type { z } from 'zod/v4';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { linkStatFiltersSchema } from '@barely/hooks';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { StatBarelyReferers } from '~/app/[handle]/_components/stat-barely-referers';
import { StatDevices } from '~/app/[handle]/_components/stat-devices';
import { StatExternalReferers } from '~/app/[handle]/_components/stat-external-referers';
import { StatLocations } from '~/app/[handle]/_components/stat-locations';
import { HydrateClient, prefetch, trpc } from '~/trpc/server';
import { LinkStatHeader } from './link-stat-header';
import { LinkTimeseries } from './link-timeseries';

export default async function LinkStatsPage({
	params,
	searchParams,
}: {
	params: Promise<{ handle: string }>;
	searchParams: Promise<z.infer<typeof linkStatFiltersSchema>>;
}) {
	const { handle } = await params;
	const filters = await searchParams;

	const parsedFilters = linkStatFiltersSchema.safeParse(filters);
	if (!parsedFilters.success) {
		console.log('parsedFilters error', parsedFilters.error);
		redirect(`/${handle}/links/stats`);
	}

	prefetch(
		trpc.stat.linkTimeseries.queryOptions({
			handle,
			...parsedFilters.data,
		}),
	);

	return (
		<HydrateClient>
			<DashContentHeader title='Link Stats' />
			<LinkStatHeader />
			<LinkTimeseries />

			<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
				<Suspense fallback={<div>Loading...</div>}>
					<StatLocations eventType='link/click' />
					<StatDevices eventType='link/click' />
					<StatExternalReferers eventType='link/click' />
					<StatBarelyReferers eventType='link/click' />
				</Suspense>
			</div>
		</HydrateClient>
	);
}

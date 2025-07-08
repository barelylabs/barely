import type { z } from 'zod/v4';
import { redirect } from 'next/navigation';
import { fmStatFiltersSchema } from '@barely/hooks';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { StatBarelyReferers } from '~/app/[handle]/_components/stat-barely-referers';
import { StatDevices } from '~/app/[handle]/_components/stat-devices';
import { StatExternalReferers } from '~/app/[handle]/_components/stat-external-referers';
import { StatLocations } from '~/app/[handle]/_components/stat-locations';
import { FmStatHeader } from '~/app/[handle]/fm/stats/fm-stat-header';
import { FmTimeseries } from '~/app/[handle]/fm/stats/fm-timeseries';
import { HydrateClient, prefetch, trpc } from '~/trpc/server';

export default async function FmStatsPage({
	params,
	searchParams,
}: {
	params: Promise<{ handle: string }>;
	searchParams: Promise<z.infer<typeof fmStatFiltersSchema>>;
}) {
	const { handle } = await params;
	const filters = await searchParams;
	const parsedFilters = fmStatFiltersSchema.safeParse(filters);
	if (!parsedFilters.success) {
		console.log('parsedFilters error', parsedFilters.error);
		redirect(`/${handle}/fm/stats`);
	}

	prefetch(trpc.stat.fmTimeseries.queryOptions({ handle, ...parsedFilters.data }));

	return (
		<HydrateClient>
			<DashContentHeader title='FM Stats' />
			<FmStatHeader />
			<FmTimeseries />

			<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
				<StatLocations eventType='fm/view' />
				<StatDevices eventType='fm/view' />
				<StatExternalReferers eventType='fm/view' />
				<StatBarelyReferers eventType='fm/view' />
			</div>
		</HydrateClient>
	);
}

import { Suspense } from 'react';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { LinkDevices } from '~/app/[handle]/links/stats/link-devices';
import { LinkLocations } from '~/app/[handle]/links/stats/link-locations';
import { LinkReferers } from '~/app/[handle]/links/stats/link-referers';
import { LinkStatsHeader } from '~/app/[handle]/links/stats/link-stats-header';
import { LinkTimeseries } from '~/app/[handle]/links/stats/link-timeseries';

export default function LinkStatsPage() {
	return (
		<>
			<DashContentHeader title='Link Stats' />
			<LinkStatsHeader />
			<Suspense fallback={<div>Loading...</div>}>
				<LinkTimeseries />
			</Suspense>

			<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
				<Suspense fallback={<div>Loading...</div>}>
					<LinkLocations />
				</Suspense>
				<Suspense fallback={<div>Loading...</div>}>
					<LinkDevices />
				</Suspense>
				<Suspense fallback={<div>Loading...</div>}>
					<LinkReferers />
				</Suspense>
			</div>
		</>
	);
}

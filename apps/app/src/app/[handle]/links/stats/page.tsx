import { Suspense } from 'react';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';

// import { StatDevices } from '~/app/[handle]/_components/stat-devices';
// import { StatLocations } from '~/app/[handle]/_components/stat-locations';
// import { StatReferers } from '~/app/[handle]/_components/stat-referers';
// import { StatsHeader } from '~/app/[handle]/_components/stats-header';
// import { LinkTimeseries } from '~/app/[handle]/links/stats/link-timeseries';

export default function LinkStatsPage() {
	return (
		<>
			<DashContentHeader title='Link Stats' />
			{/* <StatsHeader /> */}
			<Suspense fallback={<div>Loading...</div>}>{/* <LinkTimeseries /> */}</Suspense>

			<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
				{/* <StatLocations />
                        <StatDevices />
				<StatReferers /> */}
			</div>
		</>
	);
}

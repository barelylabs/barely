import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { StatBarelyReferers } from '~/app/[handle]/_components/stat-barely-referers';
import { StatDevices } from '~/app/[handle]/_components/stat-devices';
import { StatExternalReferers } from '~/app/[handle]/_components/stat-external-referers';
import { StatLocations } from '~/app/[handle]/_components/stat-locations';
import { PageStatHeader } from '~/app/[handle]/pages/stats/page-stat-header';
import { PageTimeseries } from '~/app/[handle]/pages/stats/page-timeseries';

export default function PageStatsPage() {
	return (
		<>
			<DashContentHeader title='Page Stats' />
			<PageStatHeader />
			<PageTimeseries />

			<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
				<StatLocations eventType='page/view' />
				<StatDevices eventType='page/view' />
				<StatExternalReferers eventType='page/view' />
				<StatBarelyReferers eventType='page/view' />
			</div>
		</>
	);
}

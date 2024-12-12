import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { StatDevices } from '~/app/[handle]/_components/stat-devices';
import { StatLocations } from '~/app/[handle]/_components/stat-locations';
import { StatReferers } from '~/app/[handle]/_components/stat-referers';
import { FmStatHeader } from '~/app/[handle]/fm/stats/fm-stat-header';
import { FmTimeseries } from '~/app/[handle]/fm/stats/fm-timeseries';

export default function FmStatsPage() {
	return (
		<>
			<DashContentHeader title='FM Stats' />
			<FmStatHeader />
			<FmTimeseries />

			<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
				<StatLocations eventType='fm/view' />
				<StatDevices eventType='fm/view' />
				<StatReferers eventType='fm/view' />
			</div>
		</>
	);
}

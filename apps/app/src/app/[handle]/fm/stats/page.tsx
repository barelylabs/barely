import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { StatBarelyReferers } from '~/app/[handle]/_components/stat-barely-referers';
import { StatDevices } from '~/app/[handle]/_components/stat-devices';
import { StatExternalReferers } from '~/app/[handle]/_components/stat-external-referers';
import { StatLocations } from '~/app/[handle]/_components/stat-locations';
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
				<StatExternalReferers eventType='fm/view' />
				<StatBarelyReferers eventType='fm/view' />
			</div>
		</>
	);
}

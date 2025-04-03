import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { StatBarelyReferers } from '~/app/[handle]/_components/stat-barely-referers';
import { StatDevices } from '~/app/[handle]/_components/stat-devices';
import { StatExternalReferers } from '~/app/[handle]/_components/stat-external-referers';
import { StatLocations } from '~/app/[handle]/_components/stat-locations';
import { LinkStatHeader } from './link-stat-header';
import { LinkTimeseries } from './link-timeseries';

export default function LinkStatsPage() {
	return (
		<>
			<DashContentHeader title='Link Stats' />
			<LinkStatHeader />
			<LinkTimeseries />

			<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
				<StatLocations eventType='link/click' />
				<StatDevices eventType='link/click' />
				<StatExternalReferers eventType='link/click' />
				<StatBarelyReferers eventType='link/click' />
			</div>
		</>
	);
}

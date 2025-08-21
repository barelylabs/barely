import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { VipSupportEmail } from './vip-settings';

export default function VipSettingsPage() {
	return (
		<>
			<DashContentHeader title='VIP Settings' />
			<DashContent>
				<VipSupportEmail />
			</DashContent>
		</>
	);
}

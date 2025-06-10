import { StreamingSettings } from '~/app/[handle]/settings/streaming/streaming-settings';
import { DashContentHeader } from '../../_components/dash-content-header';

export default function StreamingSettingsPage() {
	return (
		<div className='flex flex-col gap-8'>
			<DashContentHeader
				title='Streaming'
				subtitle='Manage your streaming platform connections and artist profiles.'
			/>
			<StreamingSettings />
		</div>
	);
}

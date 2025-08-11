import { StreamingSettings } from '~/app/[handle]/settings/streaming/streaming-settings';
import { DashContent } from '../../_components/dash-content';
import { DashContentHeader } from '../../_components/dash-content-header';

export default function StreamingSettingsPage() {
	return (
		<>
			<DashContentHeader
				title='Streaming'
				subtitle='Manage your streaming platform connections and artist profiles.'
			/>
			<DashContent>
				<StreamingSettings />
			</DashContent>
		</>
	);
}

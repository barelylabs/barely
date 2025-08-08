import { Suspense } from 'react';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { RemarketingSettings } from '~/app/[handle]/settings/remarketing/remarketing-settings';

export default function RemarketingSettingsPage() {
	return (
		<>
			<DashContentHeader
				title='Remarketing'
				subtitle='Remarketing settings applied to all links for this workspace.'
			/>
			<div className='flex flex-col gap-4'>
				<Suspense fallback={<div>Loading...</div>}>
					<RemarketingSettings />
				</Suspense>
			</div>
		</>
	);
}

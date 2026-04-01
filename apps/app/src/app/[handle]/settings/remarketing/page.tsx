import { Suspense } from 'react';

import { GridListSkeleton } from '@barely/ui/components/grid-list-skeleton';

import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { RemarketingSettings } from '~/app/[handle]/settings/remarketing/remarketing-settings';

export default function RemarketingSettingsPage() {
	return (
		<>
			<DashContentHeader
				title='Remarketing'
				subtitle='Remarketing settings applied to all links for this workspace.'
			/>
			<DashContent>
				<div className='flex flex-col gap-4'>
					<Suspense fallback={<GridListSkeleton />}>
						<RemarketingSettings />
					</Suspense>
				</div>
			</DashContent>
		</>
	);
}

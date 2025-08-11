// import AllCampaigns from './all-campaigns';

import { Suspense } from 'react';

import { AllCampaigns } from '~/app/[handle]/campaigns/[[...stage]]/all-campaigns';
import { CampaignTabs } from '~/app/[handle]/campaigns/[[...stage]]/campaign-tabs';
import { DashContent } from '../../_components/dash-content';
import { DashContentHeader } from '../../_components/dash-content-header';

export default function CampaignsPage() {
	return (
		<>
			<DashContentHeader
				title='Campaigns'
				subtitle='Create and manage your pitch and ad campaigns.'
			/>
			<DashContent>
				<CampaignTabs />
				<Suspense fallback={<div className='w-full'>Loading...</div>}>
					<AllCampaigns />
				</Suspense>
			</DashContent>
		</>
	);
}

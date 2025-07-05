import { Suspense } from 'react';
import { getCampaignById } from '@barely/lib/functions/campaign.fns';
import { campaignTypeDisplay } from '@barely/utils';

import { InfoCard } from '@barely/ui/card';
import { Icon } from '@barely/ui/icon';
import { Text } from '@barely/ui/typography';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { LaunchPlaylistPitchForm } from '~/app/[handle]/campaign/[campaignId]/launch/launch-playlist-pitch-form';

const LaunchCampaignPage = async ({ params }: { params: Promise<{ campaignId: string }> }) => {
	const { campaignId } = await params;
	const campaign = await getCampaignById(campaignId);

	return (
		<>
			<DashContentHeader title='Launch your campaign' />
			<Suspense fallback={<div>Loading...</div>}>
				<InfoCard
					title={campaign.track.name}
					subtitle={campaign.workspace.name}
					imageUrl={campaign.track.imageUrl}
					imageAlt={`artwork for ${campaign.track.name}`}
					stats={
						<div className='flex flex-row items-center space-x-1'>
							<Icon.broadcast className='w-3' />
							<Text variant='xs/light'>{campaignTypeDisplay(campaign.type)}</Text>
						</div>
					}
				>
					<Suspense fallback={<div>Loading outside genres input...</div>}>
						<LaunchPlaylistPitchForm campaignId={campaign.id} />
					</Suspense>
				</InfoCard>
			</Suspense>
		</>
	);
};

export default LaunchCampaignPage;

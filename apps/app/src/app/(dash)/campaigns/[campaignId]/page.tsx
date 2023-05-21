import { Suspense } from 'react';

import {  InfoCard } from '@barely/ui/elements/card';
import { Icon} from '@barely/ui/elements/icon';

import { campaignTypeDisplay } from '@barely/api/campaign/campaign.edge.fns';
import { getCampaignById } from '@barely/api/campaign/campaign.node.fns';

import {ConfettiRain} from '@barely/ui/elements/confetti';
import { Text } from '@barely/ui/elements/typography';

import { CampaignReviews } from '~/app/(dash)/campaigns/[campaignId]/campaign-reviews';
import { DashContentHeader } from '~/app/(dash)/components/dash-content-header';

const getCampaign = async (campaignId: string) => {
	const campaign = await getCampaignById(campaignId, {
		requireTrack: true,
	});

	if (!campaign) throw new Error('Campaign not found');
	return campaign;
};

const CampaignPage = async ({ params, searchParams }: {
	params: { campaignId: string }, searchParams: { success?: boolean}
 }) => {
	const initialCampaign = await getCampaign(params.campaignId);

	return (
		<>
			
			<DashContentHeader title='Your campaign'/> 			
			{searchParams.success && <ConfettiRain />}
			<Suspense fallback={<div>Loading...</div>}>
				<InfoCard
					title={initialCampaign.track.name}
					subtitle={initialCampaign.track.team.name}
					imageUrl={initialCampaign.track.imageUrl}
					imageAlt={`artwork for ${initialCampaign.track.name}`}
					stats={
						<div className='flex flex-row space-x-1 items-center'>
							<Icon.broadcast className='w-3' />
							<Text variant='xs/light'>{campaignTypeDisplay(initialCampaign.type)}</Text>
						</div>
					}
				>
					{initialCampaign.curatorReach && (
						<Suspense fallback={<div>Loading reviews...</div>}>
							{
								<CampaignReviews
									campaignId={params.campaignId}
									reach={initialCampaign.curatorReach}
								/>
							}
						</Suspense>
					)}
				</InfoCard>
			</Suspense>
			{/* </Container> */}
		</>
	);
};

export default CampaignPage;

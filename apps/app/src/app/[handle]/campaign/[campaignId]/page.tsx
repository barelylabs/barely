import { Suspense } from 'react';
import { headers } from 'next/headers';
import { db } from '@barely/lib/server/db';
import { getCampaignById } from '@barely/lib/server/routes/campaign/campaign.fns';

import { InfoCard } from '@barely/ui/elements/card';
import { ConfettiRain } from '@barely/ui/elements/confetti';
import { Icon } from '@barely/ui/elements/icon';
import { Text } from '@barely/ui/elements/typography';

import { campaignTypeDisplay } from '@barely/utils/campaign';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { CampaignReviews } from './campaign-reviews';

const getCampaign = async (campaignId: string) => {
	const campaign = await getCampaignById(campaignId, db);

	if (!campaign) throw new Error('Campaign not found');
	return campaign;
};

const CampaignPage = async ({
	params,
	searchParams,
}: {
	params: { campaignId: string };
	searchParams: { success?: boolean };
}) => {
	const initialCampaign = await getCampaign(params.campaignId);

	return (
		<>
			<DashContentHeader title='Your campaign' />
			{searchParams.success && <ConfettiRain />}
			<Suspense fallback={<div>Loading...</div>}>
				<InfoCard
					title={initialCampaign.track.name}
					subtitle={initialCampaign.workspace.name}
					imageUrl={initialCampaign.track.imageUrl}
					imageAlt={`artwork for ${initialCampaign.track.name}`}
					stats={
						<div className='flex flex-row items-center space-x-1'>
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
		</>
	);
};

export default CampaignPage;

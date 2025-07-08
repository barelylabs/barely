import { Suspense } from 'react';
import { getCampaignById } from '@barely/lib/functions/campaign.fns';
import { campaignTypeDisplay } from '@barely/utils';

import { InfoCard } from '@barely/ui/card';
import { ConfettiRain } from '@barely/ui/confetti';
import { Icon } from '@barely/ui/icon';
import { Text } from '@barely/ui/typography';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { CampaignReviews } from './campaign-reviews';

const getCampaign = async (campaignId: string) => {
	const campaign = await getCampaignById(campaignId);

	return campaign;
};

const CampaignPage = async ({
	params,
	searchParams,
}: {
	params: Promise<{ campaignId: string }>;
	searchParams: Promise<{ success?: boolean }>;
}) => {
	const awaitedParams = await params;
	const awaitedSearchParams = await searchParams;
	const initialCampaign = await getCampaign(awaitedParams.campaignId);

	return (
		<>
			<DashContentHeader title='Your campaign' />
			{awaitedSearchParams.success && <ConfettiRain />}
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
									campaignId={awaitedParams.campaignId}
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

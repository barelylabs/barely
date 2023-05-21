import { Suspense } from 'react';

import { campaignTypeDisplay } from '@barely/api/campaign/campaign.edge.fns';
import { getCampaignById } from '@barely/api/campaign/campaign.node.fns';

import { InfoCard } from '@barely/ui/elements/card';
import { Container } from '@barely/ui/elements/container';
import { Icon } from '@barely/ui/elements/icon';
import { H3, Text } from '@barely/ui/elements/typography';

import { LaunchCampaignForm } from '~/app/(dash)/campaigns/[campaignId]/launch/launch-campaign-form';

// import { TrackGenresInput } from '~/app/(dash)/components/track-genres-input';

const getCampaign = async (campaignId: string) => {
	const campaign = await getCampaignById(campaignId, {
		requireTrack: true,
	});

	// add some wait time to simulate a slow server
	// await new Promise(resolve => setTimeout(resolve, 2000));

	if (!campaign) throw new Error('Campaign not found');
	return campaign;
};

const LaunchCampaignPage = async ({ params }: { params: { campaignId: string } }) => {
	const initialCampaign = await getCampaign(params.campaignId);
	return (
		<Container className='space-y-4'>
			<H3>Launch your campaign</H3>
			{/* {sessionId && <Text variant='xs/light'>Session ID: {sessionId}</Text>} */}
			<Suspense fallback={<div>Loading in server component...</div>}>
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
					{/* <Separator className='my-2' /> */}
					<Suspense fallback={<div>Loading outside genres input...</div>}>
						{/* <TrackGenresInput initialTrack={initialCampaign.track} data-superjson /> */}
						<LaunchCampaignForm initialCampaign={initialCampaign} data-superjson />
					</Suspense>
				</InfoCard>
			</Suspense>
		</Container>
	);
};

export default LaunchCampaignPage;

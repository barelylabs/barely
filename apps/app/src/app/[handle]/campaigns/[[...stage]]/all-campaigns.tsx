'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { useWorkspace } from '@barely/hooks';
import { campaignTypeDisplay } from '@barely/utils';

import { Badge } from '@barely/ui/badge';
import { Button } from '@barely/ui/button';
import { InfoCard } from '@barely/ui/card';
import { Icon } from '@barely/ui/icon';
import { H, Text } from '@barely/ui/typography';

import { useCampaign, useCampaignSearchParams } from '~/app/[handle]/campaigns/_components/campaign-context';

export const AllCampaigns = () => {
	const { workspace } = useWorkspace();
	const { items: campaigns } = useCampaign();
	const { filters } = useCampaignSearchParams();

	if (!campaigns.length) {
		return (
			<div className='flex h-full flex-col items-center justify-center gap-y-3 rounded-lg border border-dashed px-6 py-16'>
				<Icon.sun className='h-10 w-10' />
				<H size='4'>{`No ${filters.stage ? filters.stage : ''} campaigns`}</H>
				<Text variant='xs/light'>Create a new campaign to get started.</Text>
			</div>
		);
	}

	return (
		<>
			<div className='flex flex-col gap-2'>
				{campaigns.map((campaign, campaignIndex) => {
					const description = (
						<div className='flex flex-row items-center space-x-1'>
							<Icon.broadcast className='w-3' />
							<Text variant='xs/light'>{campaignTypeDisplay(campaign.type)}</Text>
						</div>
					);

					const badge =
						campaign.stage === 'approved' ? <Badge variant='success'>Approved</Badge>
						: campaign.stage === 'screening' ? <Badge variant='warning'>Pending</Badge>
						: undefined;
					const badgeVariant = campaign.stage === 'approved' ? 'success' : undefined;

					const button =
						campaign.stage === 'approved' ?
							<Link href={`/${workspace.handle}/campaign/${campaign.id}/launch`} passHref>
								<Button>Launch Campaign 🚀</Button>
							</Link>
						: campaign.stage === 'active' ?
							<Link href={`/${workspace.handle}/campaign/${campaign.id}`} passHref>
								<Button look='muted'>View Campaign</Button>
							</Link>
						:	null;

					return (
						<Fragment key={`${campaignIndex}`}>
							<InfoCard
								imageUrl={campaign.track.imageUrl ?? ''}
								imageAlt={campaign.track.name}
								title={campaign.track.name}
								subtitle={workspace.name}
								stats={description}
								badges={badge}
								badgeVariant={badgeVariant}
								buttons={button}
							/>
						</Fragment>
					);
				})}
			</div>
		</>
	);
};

// export default AllCampaigns;

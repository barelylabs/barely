'use client';

import type { HorizontalTabItemProps } from '@barely/ui/components/horizontal-tabs';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useWorkspace } from '@barely/hooks';
import { useQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Button } from '@barely/ui/button';
import { HorizontalTabs } from '@barely/ui/components/horizontal-tabs';
import { Icon } from '@barely/ui/icon';

import { useCampaignSearchParams } from '~/app/[handle]/campaigns/_components/campaign-context';

export function CampaignTabs() {
	const trpc = useTRPC();
	const { workspace } = useWorkspace();
	const { setStage } = useCampaignSearchParams();

	const params = useParams();

	// Sync route param with search params
	useEffect(() => {
		const stageParam = params.stage?.[0];
		if (stageParam === 'all') {
			void setStage(undefined);
		} else if (
			stageParam === 'screening' ||
			stageParam === 'approved' ||
			stageParam === 'active'
		) {
			void setStage(stageParam);
		}
	}, [params.stage, setStage]);

	const { data: totals } = useQuery(
		trpc.campaign.countByWorkspaceId.queryOptions({
			workspaceId: workspace.id,
		}),
	);

	const tabs: HorizontalTabItemProps[] = [
		{
			name: 'Active',
			href: `/${workspace.handle}/campaigns/active`,
		},
		{
			name: 'Approved',
			href: `/${workspace.handle}/campaigns/approved`,
			beacon: params.stage?.[0] !== 'all' && !!totals?.approved,
		},
		{
			name: 'Screening',
			href: `/${workspace.handle}/campaigns/screening`,
		},
		{
			name: 'All',
			href: `/${workspace.handle}/campaigns/all`,
		},
	];

	return (
		<HorizontalTabs
			tabs={tabs}
			actions={
				<Button
					size='md'
					className='h-full'
					href={`/${workspace.handle}/campaigns/playlist-pitch`}
				>
					<Icon.plus className='mr-2 h-3 w-3' />
					New Campaign
				</Button>
			}
		/>
	);
}

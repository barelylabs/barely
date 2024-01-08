'use client';

import { useParams } from 'next/navigation';
import { api } from '@barely/server/api/react';

import { useWorkspace } from '@barely/hooks/use-workspace';

import type { HorizontalTabItemProps } from '@barely/ui/components/navigation/horizontal-tabs';
import { HorizontalTabs } from '@barely/ui/components/navigation/horizontal-tabs';
import { Button } from '@barely/ui/elements/button';
import { Icon } from '@barely/ui/elements/icon';

export function CampaignTabs() {
	const workspace = useWorkspace();

	const params = useParams();

	console.log({ params });

	const { data: totals } = api.campaign.countByWorkspaceId.useQuery({
		workspaceId: workspace.id,
	});

	const tabs: HorizontalTabItemProps[] = [
		{
			name: 'Active',
			href: `/${workspace.handle}/campaigns/active`,
		},
		{
			name: 'Approved',
			href: `/${workspace.handle}/campaigns/approved`,
			beacon: params?.stage?.[0] !== 'all' && !!totals?.approved,
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

// function StageCount(
// 	workspaceId: string,
// 	stage: keyof CombinedRouterOutputs['campaign']['countByWorkspaceId'],
// ) {
// 	const { data: total, isLoading } = api.campaign.countByWorkspaceId.useQuery(
// 		{
// 			workspaceId,
// 		},
// 		{
// 			select: count => count[stage],
// 		},
// 	);

// 	if (isLoading) return <Skeleton className='h-4 w-[14px]'></Skeleton>;

// 	return (
// 		<span className='text-muted-foregroun flex h-4 w-[14px] items-center font-normal text-muted-foreground'>
// 			{total}
// 		</span>
// 	);
// }

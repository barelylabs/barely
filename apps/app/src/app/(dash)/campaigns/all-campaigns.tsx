'use client';

import { Fragment, useState } from 'react';

import Link from 'next/link';

import { useAtomValue } from 'jotai';

import { campaignTypeDisplay } from '@barely/lib/api/campaign/campaign.edge.fns';

import { Badge } from '@barely/ui/elements/badge';
import { Beacon } from '@barely/ui/elements/beacon';
import { Button } from '@barely/ui/elements/button';
import { InfoCard } from '@barely/ui/elements/card';
import { Icon } from '@barely/ui/elements/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@barely/ui/elements/tabs';
import { Text } from '@barely/ui/elements/typography';

import { userAtom } from '~/atoms/user.atoms';
import { api } from '~/client/trpc';

const AllCampaigns = () => {
	const totalCampaignsQuery = api.node.campaign.countByUser.useQuery({});
	const totalScreeningCampaignsQuery = api.node.campaign.countByUser.useQuery({
		stage: 'screening',
	});
	const totalApprovedCampaignsQuery = api.node.campaign.countByUser.useQuery({
		stage: 'approved',
	});
	const totalActiveCampaignsQuery = api.node.campaign.countByUser.useQuery({
		stage: 'running',
	});

	const screeningCampaignsQuery = api.node.campaign.byUser.useInfiniteQuery(
		{
			stage: 'screening',
		},
		{
			getNextPageParam: lastPage => lastPage.nextCursor,
			refetchOnMount: false,
			staleTime: Infinity,
		},
	);

	const approvedCampaignsQuery = api.node.campaign.byUser.useInfiniteQuery(
		{
			stage: 'approved',
		},
		{
			getNextPageParam: lastPage => lastPage.nextCursor,
			refetchOnMount: false,
			staleTime: Infinity,
		},
	);

	const activeCampaignsQuery = api.node.campaign.byUser.useInfiniteQuery(
		{
			stage: 'running',
		},
		{
			getNextPageParam: lastPage => lastPage.nextCursor,
			refetchOnMount: false,
			staleTime: Infinity,
		},
	);

	const allCampaigns = [
		...(screeningCampaignsQuery.data?.pages.flatMap(page => page.campaigns) ?? []),
		...(approvedCampaignsQuery.data?.pages.flatMap(page => page.campaigns) ?? []),
		...(activeCampaignsQuery.data?.pages.flatMap(page => page.campaigns) ?? []),
	];

	const tabs = [
		{
			stage: 'all',
			label: 'All',
			pages: [{ campaigns: allCampaigns }],
			total: totalCampaignsQuery.data,
		},
		{
			stage: 'screening',
			label: 'Pending',
			pages: screeningCampaignsQuery.data?.pages,
			total: totalScreeningCampaignsQuery.data,
		},
		{
			stage: 'approved',
			label: 'Approved',
			pages: approvedCampaignsQuery.data?.pages,
			total: totalApprovedCampaignsQuery.data,
		},
		{
			stage: 'running',
			label: 'Active',
			pages: activeCampaignsQuery.data?.pages,
			total: totalActiveCampaignsQuery.data,
		},
		// { stage: 'rejected', label: 'Rejected' },
		// { stage: 'testing', label: 'Testing' },
		// { stage: 'paused', label: 'Paused' },
		// { stage: 'complete', label: 'Completed' },
	];

	// const userValues = useAtomValue(userAtom);

	const [currentTab, setCurrentTab] = useState('all');

	return (
		<>
			<Tabs defaultValue='all'>
				<div className='flex flex-row space-x-2 justify-between'>
					<TabsList>
						{tabs.map(tab => (
							<TabsTrigger
								key={tab.stage}
								value={tab.stage}
								className='relative'
								onClick={() => setCurrentTab(tab.stage)}
							>
								{tab.label} ({tab.total})
								{tab.stage === 'approved' && !!tab.total && currentTab !== 'approved' && (
									<Beacon className='-right-1 -top-1' />
								)}
							</TabsTrigger>
						))}
					</TabsList>
					<Link href='/campaigns/playlist-pitch' passHref>
						<Button>
							<Icon.plus size='13' className='mr-2' /> New Campaign
						</Button>
					</Link>
				</div>

				{tabs.map(tab => (
					<TabsContent key={tab.stage} value={tab.stage}>
						<div className='flex flex-col space-y-2'>
							{tab.pages?.map((page, pageIndex) => (
								<Fragment key={`${tab.stage}.${pageIndex}`}>
									{page.campaigns.map((campaign, campaignIndex) => {
										const description = (
											<div className='flex flex-row space-x-1 items-center'>
												<Icon.broadcast className='w-3' />
												<Text variant='xs/light'>
													{campaignTypeDisplay(campaign.type)}
												</Text>
											</div>
										);

										const badge =
											campaign.stage === 'approved' ? (
												<Badge variant='success'>Approved</Badge>
											) : campaign.stage === 'screening' ? (
												<Badge variant='warning'>Pending</Badge>
											) : undefined;
										const badgeVariant =
											campaign.stage === 'approved' ? 'success' : undefined;

										const button =
											campaign.stage === 'approved' ? (
												<Link href={`/campaigns/${campaign.id}/launch`} passHref>
													<Button>Launch Campaign 🚀</Button>
												</Link>
											) : campaign.stage === 'running' ? (
												<Link href={`/campaigns/${campaign.id}`} passHref>
													<Button variant='subtle'>View Campaign</Button>
												</Link>
											) : null;

										return (
											<Fragment key={`${tab.stage}.${pageIndex}.${campaignIndex}`}>
												<InfoCard
													imageUrl={campaign.track?.imageUrl ?? ''}
													imageAlt={campaign.track?.name}
													title={campaign.track?.name}
													subtitle={campaign.track?.team.name}
													stats={description}
													badges={badge}
													badgeVariant={badgeVariant}
													buttons={button}
												/>
											</Fragment>
										);
									})}
								</Fragment>
							))}
						</div>
					</TabsContent>
				))}
				{/* <TabsContent value='screening'>
					{screeningCampaignsQuery.data?.pages.map((page, index) => (
						<Fragment key={index}>
							{page.campaigns.map(campaign => (
								<div className='flex flex-row' key={campaign.id}>
									{!!campaign.track && (
										<>
											<Image
												src={campaign.track?.imageUrl ?? ''}
												alt={`art for ${campaign.track?.name}`}
												width={80}
												height={80}
											/>
											<div className='flex flex-col pl-4 justify-between'>
												<div>
													<Text variant='md/medium'>{campaign.track.name}</Text>
													<Text variant='sm/light'>{campaign.track.team.name}</Text>
												</div>
												<div className='flex flex-row space-x-1'>
													<Icons.broadcast className='w-3' />
													<Text variant='xs/light'>
														{campaignTypeDisplay(campaign.type)}
													</Text>
												</div>
											</div>
										</>
									)}
								</div>
							))}
						</Fragment>
					))}
				</TabsContent> */}
			</Tabs>
		</>
	);
};

export default AllCampaigns;

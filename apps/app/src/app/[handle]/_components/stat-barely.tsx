'use client';

import type { WebEventType } from '@barely/lib/server/routes/event/event.tb';
import type { BarListBarProps } from '@barely/ui/charts/bar-list';
import { useState } from 'react';
import { useWebEventStatFilters } from '@barely/lib/hooks/use-web-event-stat-filters';
import { api } from '@barely/server/api/react';

import { BarList } from '@barely/ui/charts/bar-list';
import { Card } from '@barely/ui/elements/card';
import { ScrollArea, ScrollBar } from '@barely/ui/elements/scroll-area';
import { TabButtons } from '@barely/ui/elements/tab-buttons';
import { H } from '@barely/ui/elements/typography';

export function StatBarely({ eventType }: { eventType: WebEventType }) {
	const [tab, setTab] = useState<
		| 'metaCampaigns'
		| 'metaAdSets'
		| 'metaAds'
		| 'metaPlacements'
		| 'landingPages'
		| 'emailBroadcasts'
		| 'emailTemplates'
		| 'flowActions'
	>('metaCampaigns');

	const { filtersWithHandle, getSetFilterPath } = useWebEventStatFilters();

	const { data: topMetaCampaigns } = api.stat.topMetaCampaigns.useQuery(
		filtersWithHandle,
		{
			select: data =>
				data.map(d => ({
					name: d.metaCampaignId,
					value: eventType === 'fm/linkClick' ? d.fm_linkClicks : d.fm_views,
				})),
		},
	);

	const { data: topMetaAdSets } = api.stat.topMetaAdSets.useQuery(filtersWithHandle, {
		select: data =>
			data.map(d => ({
				name: d.metaAdSetId,
				value: eventType === 'fm/linkClick' ? d.fm_linkClicks : d.fm_views,
			})),
	});

	const { data: topMetaAds } = api.stat.topMetaAds.useQuery(filtersWithHandle, {
		select: data =>
			data.map(d => ({
				name: d.metaAdId,
				value: eventType === 'fm/linkClick' ? d.fm_linkClicks : d.fm_views,
			})),
	});

	const { data: topMetaPlacements } = api.stat.topMetaPlacements.useQuery(
		filtersWithHandle,
		{
			select: data =>
				data.map(d => ({
					name: d.metaPlacementId,
					value: eventType === 'fm/linkClick' ? d.fm_linkClicks : d.fm_views,
				})),
		},
	);

	const { data: topLandingPages } = api.stat.topLandingPages.useQuery(filtersWithHandle, {
		select: data =>
			data.map(d => ({
				name: d.landingPageId,
				value: eventType === 'fm/linkClick' ? d.fm_linkClicks : d.fm_views,
			})),
	});

	const { data: topEmailBroadcasts } = api.stat.topEmailBroadcasts.useQuery(
		filtersWithHandle,
		{
			select: data =>
				data.map(d => ({
					name: d.emailBroadcastId,
					value: eventType === 'fm/linkClick' ? d.fm_linkClicks : d.fm_views,
				})),
		},
	);

	const { data: topEmailTemplates } = api.stat.topEmailTemplates.useQuery(
		filtersWithHandle,
		{
			select: data =>
				data.map(d => ({
					name: d.emailTemplateId,
					value: eventType === 'fm/linkClick' ? d.fm_linkClicks : d.fm_views,
				})),
		},
	);

	const { data: topFlowActions } = api.stat.topFlowActions.useQuery(filtersWithHandle, {
		select: data =>
			data.map(d => ({
				name: d.flowActionId,
				value: eventType === 'fm/linkClick' ? d.fm_linkClicks : d.fm_views,
			})),
	});

	const data =
		tab === 'metaCampaigns' ? topMetaCampaigns
		: tab === 'metaAdSets' ? topMetaAdSets
		: tab === 'metaAds' ? topMetaAds
		: tab === 'metaPlacements' ? topMetaPlacements
		: tab === 'landingPages' ? topLandingPages
		: tab === 'emailBroadcasts' ? topEmailBroadcasts
		: tab === 'emailTemplates' ? topEmailTemplates
		: tab === 'flowActions' ? topFlowActions
		: [];

	const plotData: BarListBarProps[] =
		data?.map(d => ({
			name: d.name,
			value: d.value,
			href:
				tab === 'metaCampaigns' ? getSetFilterPath('sessionMetaCampaignId', d.name)
				: tab === 'metaAdSets' ? getSetFilterPath('sessionMetaAdSetId', d.name)
				: tab === 'metaAds' ? getSetFilterPath('sessionMetaAdId', d.name)
				: tab === 'metaPlacements' ? getSetFilterPath('sessionMetaPlacementId', d.name)
				: tab === 'landingPages' ? getSetFilterPath('sessionLandingPageId', d.name)
				: tab === 'emailBroadcasts' ? getSetFilterPath('sessionEmailBroadcastId', d.name)
				: tab === 'emailTemplates' ? getSetFilterPath('sessionEmailTemplateId', d.name)
				: tab === 'flowActions' ? getSetFilterPath('sessionFlowActionId', d.name)
				: '#',
			target: '_self',
		})) ?? [];

	const barList = (limit?: number) => {
		return <BarList color='red' data={limit ? plotData.slice(0, limit) : plotData} />;
	};

	return (
		<Card className='h-[400px]'>
			<H size='4'>Barely</H>
			<ScrollArea className='h-[300px]'>
				<TabButtons
					tabs={[
						{ label: 'Meta Campaigns', value: 'metaCampaigns' },
						{ label: 'Meta Ad Sets', value: 'metaAdSets' },
						{ label: 'Meta Ads', value: 'metaAds' },
						{ label: 'Meta Placements', value: 'metaPlacements' },
						{ label: 'Landing Pages', value: 'landingPages' },
						{ label: 'Email Broadcasts', value: 'emailBroadcasts' },
						{ label: 'Email Templates', value: 'emailTemplates' },
						{ label: 'Flow Actions', value: 'flowActions' },
					]}
					selectedTab={tab}
					setSelectedTab={setTab}
				/>
				<ScrollBar orientation='horizontal' />
			</ScrollArea>
			{barList(9)}
		</Card>
	);
}

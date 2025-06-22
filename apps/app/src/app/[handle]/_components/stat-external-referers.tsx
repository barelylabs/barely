'use client';

import type { TopEventType } from '@barely/lib/server/routes/stat/stat.schema';
import type { BarListBarProps } from '@barely/ui/charts/bar-list';
import { useState } from 'react';
import { useWebEventStatFilters } from '@barely/lib/hooks/use-web-event-stat-filters';
import { useTRPC } from '@barely/lib/server/api/react';
import { getTopStatValue } from '@barely/lib/server/routes/stat/stat.schema';
import { useQuery } from '@tanstack/react-query';

import { BarList } from '@barely/ui/charts/bar-list';
import { Card } from '@barely/ui/elements/card';
import { ScrollArea, ScrollBar } from '@barely/ui/elements/scroll-area';
import { TabButtons } from '@barely/ui/elements/tab-buttons';
import { H } from '@barely/ui/elements/typography';

export function StatExternalReferers({ eventType }: { eventType: TopEventType }) {
	const trpc = useTRPC();
	const [tab, setTab] = useState<
		'referers' | 'metaCampaigns' | 'metaAdSets' | 'metaAds' | 'metaPlacements'
	>('referers');

	const { filtersWithHandle, getSetFilterPath } = useWebEventStatFilters();

	const { data: referers } = useQuery(
		trpc.stat.topReferers.queryOptions(
		{ ...filtersWithHandle, topEventType: eventType },
		{
			select: data =>
				data.map(d => ({
					name: d.referer,
					value: getTopStatValue(eventType, d),
				})),
			enabled: tab === 'referers',
		}),
	);

	const { data: topMetaCampaigns } = useQuery(
		trpc.stat.topMetaCampaigns.queryOptions(
		{ ...filtersWithHandle, topEventType: eventType },
		{
			select: data =>
				data.map(d => ({
					name: d.sessionMetaCampaignId,
					value: getTopStatValue(eventType, d),
				})),
			enabled: tab === 'metaCampaigns',
		}),
	);

	const { data: topMetaAds } = useQuery(
		trpc.stat.topMetaAds.queryOptions(
		{ ...filtersWithHandle, topEventType: eventType },
		{
			select: data =>
				data.map(d => ({
					name: d.sessionMetaAdId,
					value: getTopStatValue(eventType, d),
				})),
			enabled: tab === 'metaAds',
		}),
	);

	const { data: topMetaPlacements } = useQuery(
		trpc.stat.topMetaPlacements.queryOptions(
		{ ...filtersWithHandle, topEventType: eventType },
		{
			select: data =>
				data.map(d => ({
					name: d.sessionMetaPlacement,
					value: getTopStatValue(eventType, d),
				})),
			enabled: tab === 'metaPlacements',
		}),
	);

	const data =
		tab === 'referers' ? referers
		: tab === 'metaCampaigns' ? topMetaCampaigns
		: tab === 'metaAds' ? topMetaAds
		: tab === 'metaPlacements' ? topMetaPlacements
		: [];

	const plotData: BarListBarProps[] =
		data?.map(d => ({
			name: d.name,
			value: d.value,
			href:
				tab === 'referers' ? getSetFilterPath('referer', d.name)
				: tab === 'metaCampaigns' ? getSetFilterPath('sessionMetaCampaignId', d.name)
				: tab === 'metaAds' ? getSetFilterPath('sessionMetaAdId', d.name)
				: tab === 'metaPlacements' ? getSetFilterPath('sessionMetaPlacementId', d.name)
				: '#',
			target: '_self',
		})) ?? [];

	const barList = (limit?: number) => {
		return <BarList color='red' data={limit ? plotData.slice(0, limit) : plotData} />;
	};

	return (
		<Card className='h-[400px]'>
			<div className='flex flex-row items-center justify-between gap-6'>
				<H size='4'>External</H>
				<ScrollArea>
					<div className='p-2'>
						<TabButtons
							tabs={[
								{ label: 'Referers', value: 'referers' },
								{ label: 'Meta Campaigns', value: 'metaCampaigns' },
								{ label: 'Meta Ads', value: 'metaAds' },
								{ label: 'Meta Placements', value: 'metaPlacements' },
							]}
							selectedTab={tab}
							setSelectedTab={setTab}
						/>
					</div>
					<ScrollBar hidden orientation='horizontal' />
				</ScrollArea>
			</div>
			{barList(9)}
		</Card>
	);
}

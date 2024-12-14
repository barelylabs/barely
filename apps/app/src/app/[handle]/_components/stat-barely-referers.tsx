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

export function StatBarelyReferers({ eventType }: { eventType: WebEventType }) {
	const [tab, setTab] = useState<
		'landingPages' | 'emailBroadcasts' | 'emailTemplates' | 'flowActions'
	>('landingPages');

	const { filtersWithHandle, getSetFilterPath } = useWebEventStatFilters();

	const { data: topLandingPages } = api.stat.topLandingPages.useQuery(filtersWithHandle, {
		select: data =>
			data.map(d => ({
				name: d.sessionLandingPageId,
				value: eventType === 'fm/linkClick' ? d.fm_linkClicks : d.fm_views,
			})),
		enabled: tab === 'landingPages',
	});

	const { data: topEmailBroadcasts } = api.stat.topEmailBroadcasts.useQuery(
		filtersWithHandle,
		{
			select: data =>
				data.map(d => ({
					name: d.sessionEmailBroadcastId,
					value: eventType === 'fm/linkClick' ? d.fm_linkClicks : d.fm_views,
				})),
			enabled: tab === 'emailBroadcasts',
		},
	);

	const { data: topEmailTemplates } = api.stat.topEmailTemplates.useQuery(
		filtersWithHandle,
		{
			select: data =>
				data.map(d => ({
					name: d.sessionEmailTemplateId,
					value: eventType === 'fm/linkClick' ? d.fm_linkClicks : d.fm_views,
				})),
			enabled: tab === 'emailTemplates',
		},
	);

	const { data: topFlowActions } = api.stat.topFlowActions.useQuery(filtersWithHandle, {
		select: data =>
			data.map(d => ({
				name: d.sessionFlowActionId,
				value: eventType === 'fm/linkClick' ? d.fm_linkClicks : d.fm_views,
			})),
		enabled: tab === 'flowActions',
	});

	const data =
		tab === 'landingPages' ? topLandingPages
		: tab === 'emailBroadcasts' ? topEmailBroadcasts
		: tab === 'emailTemplates' ? topEmailTemplates
		: tab === 'flowActions' ? topFlowActions
		: [];

	const plotData: BarListBarProps[] =
		data?.map(d => ({
			name: d.name,
			value: d.value,
			href:
				tab === 'landingPages' ? getSetFilterPath('sessionLandingPageId', d.name)
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
			<div className='flex flex-row items-center justify-between gap-6'>
				<H size='4'>Barely</H>
				<ScrollArea>
					<div className='p-2'>
						<TabButtons
							tabs={[
								{ label: 'Landing Pages', value: 'landingPages' },
								{ label: 'Email Broadcasts', value: 'emailBroadcasts' },
								{ label: 'Email Templates', value: 'emailTemplates' },
								{ label: 'Flow Actions', value: 'flowActions' },
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

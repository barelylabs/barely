'use client';

import type { TopEventType } from '@barely/server/routes/stat/stat.schema';
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

export function StatBarelyReferers({ eventType }: { eventType: TopEventType }) {
	const trpc = useTRPC();
	const [tab, setTab] = useState<
		'landingPages' | 'emailBroadcasts' | 'emailTemplates' | 'flowActions'
	>('landingPages');

	const { filtersWithHandle, getSetFilterPath } = useWebEventStatFilters();

	const { data: topLandingPages } = useQuery(
		trpc.stat.topLandingPages.queryOptions(
			{
				...filtersWithHandle,
				topEventType: eventType,
			},
			{
				select: data =>
					data.map(d => ({
						name: d.sessionLandingPageId,
						value: getTopStatValue(eventType, d),
					})),
				enabled: tab === 'landingPages',
			},
		),
	);

	const { data: topEmailBroadcasts } = useQuery(
		trpc.stat.topEmailBroadcasts.queryOptions(
			{
				...filtersWithHandle,
				topEventType: eventType,
			},
			{
				select: data =>
					data.map(d => ({
						name: d.sessionEmailBroadcastId,
						value: getTopStatValue(eventType, d),
					})),
				enabled: tab === 'emailBroadcasts',
			},
		),
	);

	const { data: topEmailTemplates } = useQuery(
		trpc.stat.topEmailTemplates.queryOptions(
			{
				...filtersWithHandle,
				topEventType: eventType,
			},
			{
				select: data =>
					data.map(d => ({
						name: d.sessionEmailTemplateId,
						value: getTopStatValue(eventType, d),
					})),
				enabled: tab === 'emailTemplates',
			},
		),
	);

	const { data: topFlowActions } = useQuery(
		trpc.stat.topFlowActions.queryOptions(
			{
				...filtersWithHandle,
				topEventType: eventType,
			},
			{
				select: data =>
					data.map(d => ({
						name: d.sessionFlowActionId,
						value: getTopStatValue(eventType, d),
					})),
				enabled: tab === 'flowActions',
			},
		),
	);

	const data = (() => {
		switch (tab) {
			case 'landingPages':
				return topLandingPages;
			case 'emailBroadcasts':
				return topEmailBroadcasts;
			case 'emailTemplates':
				return topEmailTemplates;
			case 'flowActions':
				return topFlowActions;
			default:
				return [];
		}
	})();

	const plotData: BarListBarProps[] =
		data?.map(d => ({
			name: d.name,
			value: d.value,
			href: (() => {
				switch (tab) {
					case 'landingPages':
						return getSetFilterPath('sessionLandingPageId', d.name);
					case 'emailBroadcasts':
						return getSetFilterPath('sessionEmailBroadcastId', d.name);
					case 'emailTemplates':
						return getSetFilterPath('sessionEmailTemplateId', d.name);
					case 'flowActions':
						return getSetFilterPath('sessionFlowActionId', d.name);
					default:
						return '#';
				}
			})(),
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

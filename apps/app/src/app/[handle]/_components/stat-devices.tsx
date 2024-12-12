'use client';

import type { WebEventType } from '@barely/lib/server/routes/event/event.tb';
import { useState } from 'react';
import { useWebEventStatFilters } from '@barely/lib/hooks/use-web-event-stat-filters';
import { api } from '@barely/server/api/react';

import { BarList } from '@barely/ui/charts/bar-list';
import { Card } from '@barely/ui/elements/card';
import { BrowserIcon, DeviceIcon, OSIcon } from '@barely/ui/elements/icon';
import { TabButtons } from '@barely/ui/elements/tab-buttons';
import { H } from '@barely/ui/elements/typography';

export type DeviceTabs = 'Device' | 'Browser' | 'OS';

export function StatDevices({ eventType }: { eventType: WebEventType }) {
	const [tab, setTab] = useState<DeviceTabs>('Device');

	const { filtersWithHandle, getSetFilterPath } = useWebEventStatFilters();

	const { data: devices } = api.stat.topDevices.useQuery(filtersWithHandle, {
		select: data =>
			data.map(d => ({
				name: d.device,
				value: eventType === 'fm/linkClick' ? d.fm_linkClicks : d.fm_views,
				icon: () => <DeviceIcon display={d.device} className='my-auto mr-2 h-4 w-4' />,
				href: getSetFilterPath('device', d.device),
				target: '_self',
			})),
	});

	const { data: browsers } = api.stat.topBrowsers.useQuery(filtersWithHandle, {
		select: data =>
			data.map(d => ({
				name: d.browser,
				value: eventType === 'fm/linkClick' ? d.fm_linkClicks : d.fm_views,
				icon: () => <BrowserIcon display={d.browser} className='my-auto mr-2 h-4 w-4' />,
				href: getSetFilterPath('browser', d.browser),
				target: '_self',
			})),
	});

	const { data: operatingSystems } = api.stat.topOperatingSystems.useQuery(
		filtersWithHandle,
		{
			select: data =>
				data.map(d => ({
					name: d.os,
					value: eventType === 'fm/linkClick' ? d.fm_linkClicks : d.fm_views,
					icon: () => <OSIcon display={d.os} className='my-auto mr-2' />,
					href: getSetFilterPath('os', d.os),
					target: '_self',
				})),
		},
	);

	const listData =
		tab === 'Device' ? devices
		: tab === 'Browser' ? browsers
		: operatingSystems;

	const barList = (limit?: number) => {
		if (!listData) return null;
		return <BarList color='blue' data={limit ? listData.slice(0, limit) : listData} />;
	};
	return (
		<Card className='h-[400px]'>
			<div className='flex flex-row items-center justify-between'>
				<H size='4'>Devices</H>
				<TabButtons
					tabs={[
						{ label: 'Device', value: 'Device' },
						{ label: 'Browser', value: 'Browser' },
						{ label: 'OS', value: 'OS' },
					]}
					selectedTab={tab}
					setSelectedTab={setTab}
				/>
			</div>
			{barList(9)}
		</Card>
	);
}

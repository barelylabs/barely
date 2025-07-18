'use client';

import type { TopEventType } from '@barely/tb/schema';
import { useState } from 'react';
import { useWebEventStatFilters } from '@barely/hooks';
import { getTopStatValue } from '@barely/tb/schema';
import { useQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Card } from '@barely/ui/card';
import { BarList } from '@barely/ui/charts/bar-list';
import { BrowserIcon, DeviceIcon, OSIcon } from '@barely/ui/icon';
import { ScrollArea, ScrollBar } from '@barely/ui/scroll-area';
import { TabButtons } from '@barely/ui/tab-buttons';
import { H } from '@barely/ui/typography';

export type DeviceTabs = 'Device' | 'Browser' | 'OS';

// function getTopStatValue(
// 	eventType: TopEventType,
// 	d: {
// 		fm_linkClicks: number;
// 		fm_views: number;
// 		cart_checkoutViews: number;
// 		cart_checkoutPurchases: number;
// 		cart_upsellPurchases: number;
// 		link_clicks: number;
// 		page_views: number;
// 		page_linkClicks: number;
// 	},
// ) {
// 	if (eventType === 'fm/linkClick') return d.fm_linkClicks;
// 	if (eventType === 'fm/view') return d.fm_views;
// 	if (eventType === 'cart/viewCheckout') return d.cart_checkoutViews;
// 	if (eventType === 'cart/checkoutPurchase') return d.cart_checkoutPurchases;
// 	if (eventType === 'cart/upsellPurchase') return d.cart_upsellPurchases;
// 	if (eventType === 'link/click') return d.link_clicks;
// 	if (eventType === 'page/view') return d.page_views;
// 	if (eventType === 'page/linkClick') return d.page_linkClicks;
// 	return 0;
// }

export function StatDevices({ eventType }: { eventType: TopEventType }) {
	const trpc = useTRPC();
	const [tab, setTab] = useState<DeviceTabs>('Device');

	const { filtersWithHandle, getSetFilterPath } = useWebEventStatFilters();

	const { data: devices } = useQuery(
		trpc.stat.topDevices.queryOptions(
			{ ...filtersWithHandle, topEventType: eventType },
			{
				select: data =>
					data.map(d => ({
						name: d.device,
						value: getTopStatValue(eventType, d),
						icon: () => (
							<DeviceIcon display={d.device} className='my-auto mr-2 h-4 w-4' />
						),
						href: getSetFilterPath('device', d.device),
						target: '_self',
					})),
			},
		),
	);

	const { data: browsers } = useQuery(
		trpc.stat.topBrowsers.queryOptions(
			{ ...filtersWithHandle, topEventType: eventType },
			{
				select: data =>
					data.map(d => ({
						name: d.browser,
						value: getTopStatValue(eventType, d),

						icon: () => (
							<BrowserIcon display={d.browser} className='my-auto mr-2 h-4 w-4' />
						),
						href: getSetFilterPath('browser', d.browser),
						target: '_self',
					})),
			},
		),
	);

	const { data: operatingSystems } = useQuery(
		trpc.stat.topOperatingSystems.queryOptions(
			{ ...filtersWithHandle, topEventType: eventType },
			{
				select: data =>
					data.map(d => ({
						name: d.os,
						value: getTopStatValue(eventType, d),
						icon: () => <OSIcon display={d.os} className='my-auto mr-2' />,
						href: getSetFilterPath('os', d.os),
						target: '_self',
					})),
			},
		),
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
			<div className='flex flex-row items-center justify-between gap-6'>
				<H size='4'>Devices</H>
				<ScrollArea>
					<div className='p-2'>
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
					<ScrollBar hidden orientation='horizontal' />
				</ScrollArea>
			</div>
			{barList(8)}
		</Card>
	);
}

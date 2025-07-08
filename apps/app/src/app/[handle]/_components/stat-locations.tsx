'use client';

import type { TopEventType } from '@barely/tb/schema';
import type { BarListBarProps } from '@barely/ui/charts/bar-list';
import { useState } from 'react';
import { COUNTRIES } from '@barely/const';
import { useWebEventStatFilters } from '@barely/hooks';
import { getTopStatValue } from '@barely/tb/schema';
import { useQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Card } from '@barely/ui/card';
import { BarList } from '@barely/ui/charts/bar-list';
import { ScrollArea, ScrollBar } from '@barely/ui/scroll-area';
import { TabButtons } from '@barely/ui/tab-buttons';
import { H } from '@barely/ui/typography';

export function StatLocations({ eventType }: { eventType: TopEventType }) {
	const trpc = useTRPC();
	const [tab, setTab] = useState<'Country' | 'Region' | 'City'>('Country');

	const { filtersWithHandle, getSetFilterPath } = useWebEventStatFilters();

	const { data: countries } = useQuery(
		trpc.stat.topCountries.queryOptions({
			...filtersWithHandle,
			topEventType: eventType,
		}),
	);
	const { data: regions } = useQuery(
		trpc.stat.topRegions.queryOptions({
			...filtersWithHandle,
			topEventType: eventType,
		}),
	);
	const { data: cities } = useQuery(
		trpc.stat.topCities.queryOptions({
			...filtersWithHandle,
			topEventType: eventType,
		}),
	);

	const locationData =
		tab === 'Country' ? countries?.map(c => ({ ...c, region: '', city: '' }))
		: tab === 'Region' ? regions?.map(r => ({ ...r, city: '' }))
		: cities;

	const plotData: BarListBarProps[] =
		locationData?.map(c => ({
			name:
				tab === 'Country' ? (COUNTRIES[c.country] ?? c.country)
				: tab === 'Region' && 'region' in c ? c.region
				: c.city,
			value: getTopStatValue(eventType, c),

			icon: () => (
				<picture className='mr-2 flex items-center'>
					<img
						alt={c.country}
						src={`https://flag.vercel.app/m/${c.country}.svg`}
						className='h-3 w-5'
					/>
				</picture>
			),
			href:
				tab === 'Country' ?
					getSetFilterPath('country', c.country)
				:	getSetFilterPath('city', c.city),
			target: '_self',
		})) ?? [];

	const barList = (limit?: number) => {
		return <BarList color='amber' data={limit ? plotData.slice(0, limit) : plotData} />;
	};

	return (
		<Card className='h-[400px]'>
			<div className='flex flex-row items-center justify-between gap-6'>
				<H size='4'>Locations</H>
				<ScrollArea>
					<div className='p-2'>
						<TabButtons
							tabs={[
								{ label: 'Country', value: 'Country' },
								{ label: 'Region', value: 'Region' },
								{ label: 'City', value: 'City' },
							]}
							selectedTab={tab}
							setSelectedTab={setTab}
						/>
					</div>
					<ScrollBar hidden orientation='horizontal' />
				</ScrollArea>
			</div>
			{barList(7)}
		</Card>
	);
}

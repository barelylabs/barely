'use client';

import type { WebEventType } from '@barely/lib/server/routes/event/event.tb';
import type { BarListBarProps } from '@barely/ui/charts/bar-list';
import { useState } from 'react';
import { useWebEventStatFilters } from '@barely/lib/hooks/use-web-event-stat-filters';
import { api } from '@barely/server/api/react';

import { BarList } from '@barely/ui/charts/bar-list';
import { Card } from '@barely/ui/elements/card';
import { TabButtons } from '@barely/ui/elements/tab-buttons';
import { H } from '@barely/ui/elements/typography';

import { COUNTRIES } from '@barely/utils/constants';

export function StatLocations({ eventType }: { eventType: WebEventType }) {
	const [tab, setTab] = useState<'Country' | 'Region' | 'City'>('Country');

	const { filtersWithHandle, getSetFilterPath } = useWebEventStatFilters();

	const { data: countries } = api.stat.topCountries.useQuery(filtersWithHandle);
	const { data: regions } = api.stat.topRegions.useQuery(filtersWithHandle);
	const { data: cities } = api.stat.topCities.useQuery(filtersWithHandle);

	const locationData =
		tab === 'Country' ? countries?.map(c => ({ ...c, region: '', city: '' }))
		: tab === 'Region' ? regions?.map(r => ({ ...r, city: '' }))
		: cities;

	const plotData: BarListBarProps[] =
		!locationData ?
			[]
		:	locationData?.map(c => ({
				name:
					tab === 'Country' ? COUNTRIES[c.country] ?? c.country
					: tab === 'Region' && 'region' in c ? c.region ?? ''
					: c.city,
				value: eventType === 'fm/linkClick' ? c.fm_linkClicks : c.fm_views,
				icon: () => (
					<picture className='mr-2 flex items-center '>
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
			}));

	const barList = (limit?: number) => {
		return <BarList color='amber' data={limit ? plotData.slice(0, limit) : plotData} />;
	};

	return (
		<Card className='h-[400px]'>
			<div className='flex flex-row items-center justify-between'>
				<H size='4'>Locations</H>
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
			{barList(7)}
		</Card>
	);
}

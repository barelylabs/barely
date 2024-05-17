'use client';

import { useWebEventStatFilters } from '@barely/lib/hooks/use-web-event-stat-filters';
import { api } from '@barely/server/api/react';

import { AreaChart } from '@barely/ui/charts/area-chart';
import { Card } from '@barely/ui/elements/card';
import { Icon } from '@barely/ui/elements/icon';
import { H, Text } from '@barely/ui/elements/typography';

import { nFormatter } from '@barely/utils/number';

import { WebEventFilterBadges } from '~/app/[handle]/_components/filter-badges';

export function LinkTimeseries() {
	const { filters, formatTimestamp, badgeFilters } = useWebEventStatFilters();

	const [timeseries] = api.stat.linkTimeseries.useSuspenseQuery(
		{ ...filters },
		{
			select: data =>
				data.map(row => ({
					...row,
					date: formatTimestamp(row.date),
				})),
		},
	);

	const totalClicks = timeseries.reduce((acc, row) => acc + row.clicks, 0);

	return (
		<Card className='p-6'>
			<div className='flex flex-row items-center justify-between'>
				<div className='flex flex-col gap-1'>
					<div className='flex flex-row items-end gap-1'>
						<H size='1'>{totalClicks}</H>
						<Icon.stat className='mb-0.5 h-7 w-7' />
					</div>
					<Text variant='sm/medium' className='uppercase'>
						TOTAL CLICKS
					</Text>
				</div>
				<div className='flex flex-row justify-between gap-2'>
					<WebEventFilterBadges filters={badgeFilters} />
				</div>
			</div>
			<AreaChart
				className='mt-4 h-72 '
				data={timeseries}
				index='date'
				categories={['clicks']}
				colors={['indigo']}
				showXAxis={true}
				showLegend={false}
				curveType='linear'
				yAxisWidth={30}
				valueFormatter={v => nFormatter(v)}
			/>
		</Card>
	);
}

'use client';

import { useLinkStatFilters } from '@barely/hooks';
// import { useWorkspace } from '@barely/hooks';
// import { cn } from '@barely/utils';
import { useTRPC } from '@barely/api/app/trpc.react';
import { useSuspenseQuery } from '@tanstack/react-query';

import { AreaChart } from '@barely/ui/charts/area-chart';
import { Card } from '@barely/ui/card';
import { InfoTabButton } from '@barely/ui/info-tab-button';

import { nFormatter } from '@barely/utils';

import { WebEventFilterBadges } from '~/app/[handle]/_components/filter-badges';

export function LinkTimeseries() {
	const { filtersWithHandle, formatTimestamp, badgeFilters } = useLinkStatFilters();

	// const {showVisits, showClicks} = filters;

	const trpc = useTRPC();
	const { data: timeseries } = useSuspenseQuery(
		trpc.stat.linkTimeseries.queryOptions(
			{ ...filtersWithHandle },
			{
				select: data =>
					data.map(row => ({
						...row,
						date: formatTimestamp(row.start),
					})),
			},
		),
	);

	const totalClicks = timeseries.reduce((acc, row) => acc + row.link_clicks, 0);

	const chartData = timeseries.map(row => ({
		...row,
		clicks: row.link_clicks,
	}));

	return (
		<Card className='p-6'>
			<div className='flex flex-row items-center justify-between'>
				{/* <div className='flex flex-row'>
					<div className='flex flex-row items-center gap-1'>
						<div className='m-auto mb-0.5 rounded-sm bg-slate-500 p-[3px]'>
							<Icon.click className='h-3.5 w-3.5 text-white' />
						</div>
						<Text variant='sm/medium' className='uppercase'>
							CLICKS
						</Text>
					</div>
					<H size='4'>{totalClicks}</H>
				</div> */}
				<InfoTabButton
					icon='click'
					label='CLICKS'
					value={totalClicks}
					selected={true}
					selectedClassName='border-blue-500 bg-blue-100'
					isLeft
					isRight
				/>

				<div className='flex flex-row justify-between gap-2'>
					<WebEventFilterBadges filters={badgeFilters} />
				</div>
			</div>

			<AreaChart
				className='mt-4 h-72'
				data={chartData}
				index='date'
				categories={['clicks']}
				colors={['blue']}
				showXAxis={true}
				showLegend={false}
				curveType='linear'
				yAxisWidth={30}
				valueFormatter={v => nFormatter(v)}
			/>
		</Card>
	);
}

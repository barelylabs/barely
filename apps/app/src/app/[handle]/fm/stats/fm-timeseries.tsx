'use client';

import { useState } from 'react';
import { useWebEventStatFilters } from '@barely/lib/hooks/use-web-event-stat-filters';
import { cn } from '@barely/lib/utils/cn';
import { api } from '@barely/server/api/react';

import { AreaChart } from '@barely/ui/charts/area-chart';
import { Card } from '@barely/ui/elements/card';
import { Icon } from '@barely/ui/elements/icon';
import { H, Text } from '@barely/ui/elements/typography';

import { calcPercent, nFormatter } from '@barely/utils/number';

import { WebEventFilterBadges } from '~/app/[handle]/_components/filter-badges';

export function FmTimeseries() {
	const { filtersWithHandle, formatTimestamp, badgeFilters } = useWebEventStatFilters();

	const { data: timeseries } = api.stat.fmTimeseries.useQuery(
		{ ...filtersWithHandle },
		{
			select: data =>
				data.map(row => ({
					...row,
					date: formatTimestamp(row.date),
				})),
		},
	);

	const totalVisits = timeseries?.reduce((acc, row) => acc + row.visits, 0);
	const totalClicks = timeseries?.reduce((acc, row) => acc + row.clicks, 0);

	const [showVisits, setShowVisits] = useState(true);
	const [showClicks, setShowClicks] = useState(true);

	const chartData = (timeseries ?? [])?.map(row => ({
		...row,
		visits: showVisits ? row.visits : undefined,
		clicks: showClicks ? row.clicks : undefined,
	}));

	return (
		<Card className='p-6'>
			<div className='flex flex-row items-center justify-between'>
				<div className='flex flex-row'>
					<button
						type='button'
						className={cn(
							'flex flex-col gap-1 rounded-tl-md py-3 pl-3 pr-8',
							showVisits && 'border-b-3 border-slate-500 bg-slate-100',
						)}
						onClick={() => setShowVisits(!showVisits)}
					>
						<div className='flex flex-row items-center gap-1'>
							<div className='m-auto mb-0.5 rounded-sm bg-slate-500 p-[3px]'>
								<Icon.view className='h-3.5 w-3.5 text-white' />
							</div>
							<Text variant='sm/medium' className='uppercase'>
								VISITS
							</Text>
						</div>
						<H size='4'>{totalVisits}</H>
					</button>

					<button
						type='button'
						className={cn(
							'flex flex-col gap-1 rounded-tr-md py-3 pl-4 pr-8',
							showClicks && 'border-b-3 border-blue-500 bg-blue-100',
						)}
						onClick={() => setShowClicks(!showClicks)}
					>
						<div className='flex flex-row items-center gap-1'>
							<div className='m-auto rounded-sm bg-blue p-0.5'>
								<Icon.click className='mb-[1px] h-3.5 w-3.5 text-white' />
							</div>
							<Text variant='sm/medium' className='uppercase '>
								CLICKS
							</Text>
						</div>
						<div className='flex flex-row items-baseline gap-1'>
							<H size='4'>{totalClicks}</H>
							<Text
								variant='sm/medium'
								className='uppercase tracking-[-.05em] text-muted-foreground'
							>
								({calcPercent(totalClicks ?? 0, totalVisits ?? 0)})
							</Text>
						</div>
					</button>
				</div>

				<div className='flex flex-row justify-between gap-2'>
					<WebEventFilterBadges filters={badgeFilters} />
				</div>
			</div>

			{/* <pre>{JSON.stringify(chartData, null, 2)}</pre> */}

			<AreaChart
				className='mt-4 h-72 '
				data={chartData}
				index='date'
				categories={['visits', 'clicks']}
				colors={['slate', 'blue']}
				showXAxis={true}
				showLegend={false}
				// curveType={filtersWithHandle.dateRange === '1d' ? 'linear' : 'natural'}
				curveType='linear'
				yAxisWidth={30}
				valueFormatter={v => nFormatter(v)}
			/>
		</Card>
	);
}

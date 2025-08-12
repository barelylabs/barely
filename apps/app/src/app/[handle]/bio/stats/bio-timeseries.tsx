'use client';

import { useBioStatFilters } from '@barely/hooks';
import { calcPercent, cn, nFormatter } from '@barely/utils';
import { useSuspenseQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Card } from '@barely/ui/card';
import { AreaChart } from '@barely/ui/charts/area-chart';
import { Icon } from '@barely/ui/icon';
import { H, Text } from '@barely/ui/typography';

import { WebEventFilterBadges } from '~/app/[handle]/_components/filter-badges';

export function BioTimeseries() {
	const {
		filtersWithHandle,
		uiFilters,
		formatTimestamp,
		badgeFilters,
		toggleShowViews,
		toggleShowClicks,
		toggleShowEmailCaptures,
	} = useBioStatFilters();

	const { showViews, showClicks, showEmailCaptures } = uiFilters;

	const trpc = useTRPC();
	const { data: timeseries } = useSuspenseQuery(
		trpc.stat.bioTimeseries.queryOptions(
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

	const totalViews = timeseries.reduce((acc, row) => acc + row.bio_views, 0);
	const totalClicks = timeseries.reduce((acc, row) => acc + row.bio_buttonClicks, 0);
	const totalEmailCaptures = timeseries.reduce(
		(acc, row) => acc + row.bio_emailCaptures,
		0,
	);

	const chartData = timeseries.map(row => ({
		...row,
		views: showViews ? row.bio_views : undefined,
		clicks: showClicks ? row.bio_buttonClicks : undefined,
		emailCaptures: showEmailCaptures ? row.bio_emailCaptures : undefined,
	}));

	return (
		<Card className='p-6'>
			<div className='flex flex-row items-center justify-between'>
				<div className='flex flex-row'>
					<button
						type='button'
						className={cn(
							'flex flex-col gap-1 rounded-tl-md py-3 pl-3 pr-8',
							showViews && 'border-b-3 border-slate-500 bg-slate-100',
						)}
						onClick={toggleShowViews}
					>
						<div className='flex flex-row items-center gap-1'>
							<div className='m-auto mb-0.5 rounded-sm bg-slate-500 p-[3px]'>
								<Icon.view className='h-3.5 w-3.5 text-white' />
							</div>
							<Text variant='sm/medium' className='uppercase'>
								VIEWS
							</Text>
						</div>
						<H size='4'>{totalViews}</H>
					</button>

					<button
						type='button'
						className={cn(
							'flex flex-col gap-1 py-3 pl-4 pr-8',
							showClicks && 'border-b-3 border-blue-500 bg-blue-100',
						)}
						onClick={toggleShowClicks}
					>
						<div className='flex flex-row items-center gap-1'>
							<div className='m-auto rounded-sm bg-blue p-0.5'>
								<Icon.click className='mb-[1px] h-3.5 w-3.5 text-white' />
							</div>
							<Text variant='sm/medium' className='uppercase'>
								BUTTON CLICKS
							</Text>
						</div>
						<div className='flex flex-row items-baseline gap-1'>
							<H size='4'>{totalClicks}</H>
							<Text
								variant='sm/medium'
								className='uppercase tracking-[-.05em] text-muted-foreground'
							>
								({calcPercent(totalClicks, totalViews)})
							</Text>
						</div>
					</button>

					<button
						type='button'
						className={cn(
							'flex flex-col gap-1 rounded-tr-md py-3 pl-4 pr-8',
							showEmailCaptures && 'border-b-3 border-green-500 bg-green-100',
						)}
						onClick={toggleShowEmailCaptures}
					>
						<div className='flex flex-row items-center gap-1'>
							<div className='m-auto rounded-sm bg-green p-0.5'>
								<Icon.email className='mb-[1px] h-3.5 w-3.5 text-white' />
							</div>
							<Text variant='sm/medium' className='uppercase'>
								EMAIL CAPTURES
							</Text>
						</div>
						<div className='flex flex-row items-baseline gap-1'>
							<H size='4'>{totalEmailCaptures}</H>
							<Text
								variant='sm/medium'
								className='uppercase tracking-[-.05em] text-muted-foreground'
							>
								({calcPercent(totalEmailCaptures, totalViews)})
							</Text>
						</div>
					</button>
				</div>

				<div className='flex flex-row justify-between gap-2'>
					<WebEventFilterBadges filters={badgeFilters} />
				</div>
			</div>

			<AreaChart
				className='mt-4 h-72'
				data={chartData}
				index='date'
				categories={['views', 'clicks', 'emailCaptures']}
				colors={['slate', 'blue', 'green']}
				showXAxis={true}
				showLegend={false}
				curveType='linear'
				yAxisWidth={30}
				valueFormatter={v => nFormatter(v)}
			/>
		</Card>
	);
}

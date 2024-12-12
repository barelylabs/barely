// 'use client';

// import { useWebEventStatFilters } from '@barely/lib/hooks/use-web-event-stat-filters';
// import { useWorkspace } from '@barely/lib/hooks/use-workspace';
// import { api } from '@barely/lib/server/api/react';
// import { nFormatter } from '@barely/lib/utils/number';

// import { AreaChart } from '@barely/ui/charts/area-chart';
// import { Card } from '@barely/ui/elements/card';
// import { Icon } from '@barely/ui/elements/icon';
// import { H, Text } from '@barely/ui/elements/typography';

// import { WebEventFilterBadges } from '~/app/[handle]/_components/filter-badges';

// export function CartTimeseries() {
// 	const { handle } = useWorkspace();

// 	const { filters, formatTimestamp, badgeFilters } = useWebEventStatFilters();

// 	const [initiateCheckoutTimeseries] = api.stat.webEventTimeseries.useSuspenseQuery(
// 		{ ...filters, handle },
// 		{
// 			select: data =>
// 				data.map(row => ({
// 					...row,
// 					date: formatTimestamp(row.date),
// 				})),
// 		},
// 	);

// 	const totalInitiateCheckouts = initiateCheckoutTimeseries.reduce(
// 		(acc, row) => acc + row.events,
// 		0,
// 	);

// 	const [addPaymentInfoTimeseries] = api.stat.webEventTimeseries.useSuspenseQuery(
// 		{ ...filters, handle, types: ['cart/addPaymentInfo'] },
// 		{
// 			select: data => data.map(row => ({ ...row, date: formatTimestamp(row.date) })),
// 		},
// 	);

// 	const totalAddPaymentInfo = addPaymentInfoTimeseries.reduce(
// 		(acc, row) => acc + row.events,
// 		0,
// 	);

// 	return (
// 		<Card className='p-6'>
// 			<div className='flex flex-row items-center justify-between'>
// 				<div className='flex flex-col gap-1'>
// 					<div className='flex flex-row items-end gap-1'>
// 						<H size='1'>{totalInitiateCheckouts}</H>
// 						<Icon.stat className='mb-0.5 h-7 w-7' />
// 					</div>
// 					<Text variant='sm/medium' className='uppercase'>
// 						TOTAL INITIATE CHECKOUTS
// 					</Text>
// 				</div>
// 				<div className='flex flex-row justify-between gap-2'>
// 					<WebEventFilterBadges filters={badgeFilters} />
// 				</div>
// 			</div>
// 			<AreaChart
// 				className='mt-4 h-72 '
// 				data={initiateCheckoutTimeseries}
// 				index='date'
// 				categories={['events']}
// 				colors={['indigo']}
// 				showXAxis={true}
// 				showLegend={false}
// 				curveType='linear'
// 				yAxisWidth={30}
// 				valueFormatter={v => nFormatter(v)}
// 			/>
// 			<div className='flex flex-row items-center justify-between'>
// 				<div className='flex flex-col gap-1'>
// 					<div className='flex flex-row items-end gap-1'>
// 						<H size='1'>{totalAddPaymentInfo}</H>
// 						<Icon.stat className='mb-0.5 h-7 w-7' />
// 					</div>
// 					<Text variant='sm/medium' className='uppercase'>
// 						TOTAL ADD PAYMENT INFO
// 					</Text>
// 				</div>
// 			</div>
// 			<AreaChart
// 				className='mt-4 h-72 '
// 				data={addPaymentInfoTimeseries}
// 				index='date'
// 				categories={['events']}
// 				colors={['indigo']}
// 				showXAxis={true}
// 				showLegend={false}
// 				curveType='linear'
// 				yAxisWidth={30}
// 				valueFormatter={v => nFormatter(v)}
// 			/>
// 		</Card>
// 	);
// }

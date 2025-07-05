'use client';

import { usePageStatFilters } from '@barely/hooks';
import { useTRPC } from '@barely/api/app/trpc.react';
import { useSuspenseQuery } from '@tanstack/react-query';

import { AreaChart } from '@barely/ui/charts/area-chart';
import { Card } from '@barely/ui/card';
import { InfoTabButton } from '@barely/ui/info-tab-button';

import { calcPercent } from '@barely/utils';

import { WebEventFilterBadges } from '~/app/[handle]/_components/filter-badges';

export function PageTimeseries() {
	const {
		filtersWithHandle,
		uiFilters,
		formatTimestamp,
		badgeFilters,
		toggleShowVisits,
		toggleShowClicks,
		// toggleShowEmailAdds,
		// toggleShowShippingInfoAdds,
		// toggleShowPaymentInfoAdds,
		// toggleShowMainWithoutBumpPurchases,
		// toggleShowMainWithBumpPurchases,
		// toggleShowUpsellPurchases,
		// toggleShowUpsellDeclines,
		// toggleShowPurchases,
		// toggleShowGrossSales,
		// toggleShowProductSales,
		// toggleShowNetSales,
	} = usePageStatFilters();

	const {
		showVisits,
		showClicks,
		// showEmailAdds,
		// showShippingInfoAdds,
		// showPaymentInfoAdds,
		// showMainWithoutBumpPurchases,
		// showMainWithBumpPurchases,
		// showUpsellPurchases,
		// showUpsellDeclines,
		// showPurchases,
		// showGrossSales,
		// showProductSales,
		// showNetSales,
	} = uiFilters;

	const trpc = useTRPC();
	const { data: timeseries } = useSuspenseQuery(
		trpc.stat.pageTimeseries.queryOptions(
			{ ...filtersWithHandle },
			{
				select: data => data.map(row => ({ ...row, date: formatTimestamp(row.start) })),
			},
		),
	);

	const totalVisits = timeseries.reduce((acc, row) => acc + row.page_views, 0);
	const totalClicks = timeseries.reduce((acc, row) => acc + row.page_linkClicks, 0);

	const chartData = timeseries.map(row => ({
		...row,
		visits: showVisits ? row.page_views : undefined,
		clicks: showClicks ? row.page_linkClicks : undefined,
	}));

	return (
		<Card className='p-6'>
			<div className='flex flex-row items-center justify-between'>
				<div className='flex flex-row items-center justify-between'>
					<div className='flex flex-row'>
						<InfoTabButton
							icon='view'
							label='VISITS'
							value={totalVisits}
							onClick={toggleShowVisits}
							selected={showVisits}
							selectedClassName='border-slate-500 bg-slate-100'
							isLeft
						/>

						<InfoTabButton
							icon='click'
							label='CLICKS'
							value={totalClicks}
							subValue={calcPercent(totalClicks, totalVisits)}
							selected={showClicks}
							onClick={toggleShowClicks}
							iconBackgroundClassName='bg-blue'
							selectedClassName='border-blue-500 bg-blue-100'
						/>
					</div>

					<div className='flex flex-row justify-between gap-2'>
						<WebEventFilterBadges filters={badgeFilters} />
					</div>
				</div>
			</div>

			<AreaChart
				className='mt-4 h-72'
				data={chartData}
				index='date'
				showLegend={false}
				categories={['visits', 'clicks']}
				colors={['gray', 'blue']}
			/>
		</Card>
	);
}

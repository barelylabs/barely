'use client';

import { usePageStatFilters } from '@barely/lib/hooks/use-page-stat-filters';
import { api } from '@barely/server/api/react';

import { AreaChart } from '@barely/ui/charts/area-chart';
import { Card } from '@barely/ui/elements/card';
import { InfoTabButton } from '@barely/ui/elements/info-tab-button';

import { calcPercent } from '@barely/utils/number';

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

	const { data: timeseries } = api.stat.pageTimeseries.useQuery(
		{ ...filtersWithHandle },
		{
			select: data => data.map(row => ({ ...row, date: formatTimestamp(row.start) })),
		},
	);

	const totalVisits = timeseries?.reduce((acc, row) => acc + row.page_views, 0);
	const totalClicks = timeseries?.reduce((acc, row) => acc + row.page_linkClicks, 0);

	const chartData = (timeseries ?? [])?.map(row => ({
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
							value={totalVisits ?? 0}
							onClick={toggleShowVisits}
							selected={showVisits}
							selectedClassName='border-slate-500 bg-slate-100'
							isLeft
						/>

						<InfoTabButton
							icon='click'
							label='CLICKS'
							value={totalClicks ?? 0}
							subValue={calcPercent(totalClicks ?? 0, totalVisits ?? 0)}
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

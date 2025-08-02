'use client';

import { useCartStatSearchParams, useFormatTimestamp, useWorkspace } from '@barely/hooks';
import { calcPercent, formatCentsToDollars } from '@barely/utils';
import { useSuspenseQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Card } from '@barely/ui/card';
import { AreaChart } from '@barely/ui/charts/area-chart';
import { InfoTabButton } from '@barely/ui/info-tab-button';

import { WebEventFilterBadges } from '~/app/[handle]/_components/filter-badges';

export function CartTimeseries() {
	const trpc = useTRPC();
	const { handle } = useWorkspace();
	const {
		filters,
		toggleShowVisits,
		// toggleShowEmailAdds,
		// toggleShowShippingInfoAdds,
		toggleShowPaymentInfoAdds,
		// toggleShowMainWithoutBumpPurchases,
		// toggleShowMainWithBumpPurchases,
		// toggleShowUpsellPurchases,
		// toggleShowUpsellDeclines,
		toggleShowPurchases,
		toggleShowGrossSales,
		toggleShowProductSales,
	} = useCartStatSearchParams();

	const { formatTimestamp } = useFormatTimestamp(filters.dateRange);

	const {
		showVisits,
		showEmailAdds,
		showShippingInfoAdds,
		showPaymentInfoAdds,
		showMainWithoutBumpPurchases,
		showMainWithBumpPurchases,
		showUpsellPurchases,
		showPurchases,
		showGrossSales,
		showProductSales,
		dateRange,
		selectedIds,
		start,
		end,
		...otherFilters
	} = filters;

	const filtersWithHandle = { handle, ...filters };
	const badgeFilters = Object.entries(otherFilters).filter(
		([key]) => key !== 'assetId',
	) as [keyof typeof otherFilters, string][];

	const { data: timeseries } = useSuspenseQuery(
		trpc.stat.cartTimeseries.queryOptions(
			{ ...filtersWithHandle },
			{
				select: data => data.map(row => ({ ...row, date: formatTimestamp(row.start) })),
			},
		),
	);

	const totalVisits = timeseries.reduce((acc, row) => acc + row.cart_checkoutViews, 0);
	// const totalEmailAdds = timeseries?.reduce((acc, row) => acc + row.cart_emailAdds, 0);
	// const totalShippingInfoAdds = timeseries?.reduce(
	// 	(acc, row) => acc + row.cart_shippingInfoAdds,
	// 	0,
	// );
	const totalPaymentInfoAdds = timeseries.reduce(
		(acc, row) => acc + row.cart_paymentInfoAdds,
		0,
	);

	const totalMainWithoutBumpPurchases = timeseries.reduce(
		(acc, row) => acc + row.cart_mainWithoutBumpPurchases,
		0,
	);
	const totalMainWithBumpPurchases = timeseries.reduce(
		(acc, row) => acc + row.cart_mainWithBumpPurchases,
		0,
	);
	// const totalUpsellPurchases = timeseries?.reduce(
	// 	(acc, row) => acc + row.cart_upsellPurchases,
	// 	0,
	// );
	const totalPurchases = totalMainWithoutBumpPurchases + totalMainWithBumpPurchases;

	const totalGrossSales = timeseries.reduce(
		(acc, row) => acc + row.cart_checkoutPurchaseGrossAmount,
		0,
	);
	const totalProductSales = timeseries.reduce(
		(acc, row) => acc + row.cart_checkoutPurchaseProductAmount,
		0,
	);

	const salesData = timeseries.map(row => ({
		...row,
		grossSales: showGrossSales ? row.cart_checkoutPurchaseGrossAmount : undefined,
		productSales: showProductSales ? row.cart_checkoutPurchaseProductAmount : undefined,
	}));

	const kpiData = timeseries.map(row => ({
		...row,
		visits: showVisits ? row.cart_checkoutViews : undefined,
		emailAdds: showEmailAdds ? row.cart_emailAdds : undefined,
		shippingInfoAdds: showShippingInfoAdds ? row.cart_shippingInfoAdds : undefined,
		paymentInfoAdds: showPaymentInfoAdds ? row.cart_paymentInfoAdds : undefined,
		mainWithoutBumpPurchases:
			showMainWithoutBumpPurchases ? row.cart_mainWithoutBumpPurchases : undefined,
		mainWithBumpPurchases:
			showMainWithBumpPurchases ? row.cart_mainWithBumpPurchases : undefined,
		upsellPurchases: showUpsellPurchases ? row.cart_upsellPurchases : undefined,
		purchases: showPurchases ? row.cart_checkoutPurchases : undefined,

		grossSales: showGrossSales ? row.cart_checkoutPurchaseGrossAmount : undefined,
		productSales: showProductSales ? row.cart_checkoutPurchaseProductAmount : undefined,
	}));

	return (
		<Card className='gap-10 p-6'>
			<div className='flex flex-col gap-4'>
				<div className='flex flex-row items-center justify-between'>
					<div className='flex flex-row'>
						<InfoTabButton
							icon='view'
							label='GROSS SALES'
							value={formatCentsToDollars(totalGrossSales)}
							onClick={toggleShowGrossSales}
							selected={showGrossSales}
							selectedClassName='border-slate-500 bg-slate-100'
							isLeft
						/>

						<InfoTabButton
							icon='view'
							label='PRODUCT SALES'
							value={formatCentsToDollars(totalProductSales)}
							onClick={toggleShowProductSales}
							selected={showProductSales}
							iconBackgroundClassName='bg-green'
							selectedClassName='border-green-500 bg-green-100'
						/>
					</div>
				</div>

				<AreaChart
					className='mt-4 h-72'
					data={salesData}
					index='date'
					showLegend={false}
					categories={['grossSales', 'productSales']}
					colors={['gray', 'green']}
					valueFormatter={value => formatCentsToDollars(value)}
				/>
			</div>
			<div className='flex flex-col gap-4'>
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
							icon='payment'
							label='ADDED PAYMENT'
							value={totalPaymentInfoAdds}
							subValue={calcPercent(totalPaymentInfoAdds, totalVisits)}
							selected={showPaymentInfoAdds}
							onClick={toggleShowPaymentInfoAdds}
							iconBackgroundClassName='bg-blue'
							selectedClassName='border-blue-500 bg-blue-100'
						/>

						<InfoTabButton
							icon='purchase'
							label='PURCHASES'
							value={totalPurchases}
							subValue={calcPercent(totalPurchases, totalVisits)}
							selected={showPurchases}
							onClick={toggleShowPurchases}
							iconBackgroundClassName='bg-green'
							selectedClassName='border-green-500 bg-green-100'
						/>
					</div>

					<div className='flex flex-row justify-between gap-2'>
						<WebEventFilterBadges filters={badgeFilters} />
					</div>
				</div>

				<AreaChart
					className='mt-4 h-72'
					data={kpiData}
					index='date'
					showLegend={false}
					categories={['visits', 'paymentInfoAdds', 'purchases']}
					colors={['gray', 'blue', 'green']}
				/>
			</div>
		</Card>
	);
}

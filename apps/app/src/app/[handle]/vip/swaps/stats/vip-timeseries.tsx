'use client';

import type { AppRouterOutputs } from '@barely/lib/trpc/app.route';
import { useState } from 'react';
import { useVipStatFilters } from '@barely/hooks';
import { cn, nFormatter } from '@barely/utils';
import { useSuspenseQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Card } from '@barely/ui/card';
import { AreaChart } from '@barely/ui/charts/area-chart';

type VipTimeseriesRow = AppRouterOutputs['stat']['vipTimeseries'][number];

export function VipTimeseries() {
	const { filtersWithHandle, formatTimestamp } = useVipStatFilters();
	const trpc = useTRPC();

	// State to track which series are visible
	const [visibleSeries, setVisibleSeries] = useState({
		views: true,
		emailCaptures: true,
		downloads: true,
	});

	const { data: timeseries } = useSuspenseQuery({
		...trpc.stat.vipTimeseries.queryOptions(filtersWithHandle),
	});

	const totalViews = timeseries.reduce(
		(acc: number, d: VipTimeseriesRow) => acc + d.vip_views,
		0,
	);
	const totalEmailCaptures = timeseries.reduce(
		(acc: number, d: VipTimeseriesRow) => acc + d.vip_emailCaptures,
		0,
	);
	const totalDownloads = timeseries.reduce(
		(acc: number, d: VipTimeseriesRow) => acc + d.vip_downloads,
		0,
	);

	const conversionRate =
		totalViews > 0 ? ((totalEmailCaptures / totalViews) * 100).toFixed(1) : '0';
	const downloadRate =
		totalEmailCaptures > 0 ?
			((totalDownloads / totalEmailCaptures) * 100).toFixed(1)
		:	'0';

	// Prepare chart data
	const chartData = timeseries.map(row => ({
		date: formatTimestamp(row.start),
		views: row.vip_views,
		emailCaptures: row.vip_emailCaptures,
		downloads: row.vip_downloads,
	}));

	// Filter categories based on visible series
	const categories = [];
	const colors = [];
	if (visibleSeries.views) {
		categories.push('views');
		colors.push('blue');
	}
	if (visibleSeries.emailCaptures) {
		categories.push('emailCaptures');
		colors.push('green');
	}
	if (visibleSeries.downloads) {
		categories.push('downloads');
		colors.push('purple');
	}

	const toggleSeries = (series: keyof typeof visibleSeries) => {
		setVisibleSeries(prev => ({
			...prev,
			[series]: !prev[series],
		}));
	};

	return (
		<div className='space-y-4'>
			<div className='grid grid-cols-1 gap-4 md:grid-cols-5'>
				<button
					onClick={() => toggleSeries('views')}
					className={cn(
						'rounded-lg border bg-card p-4 text-left transition-all hover:shadow-md',
						visibleSeries.views ? 'border-blue-500 bg-blue-50' : 'opacity-60',
					)}
				>
					<p className='text-sm font-medium text-muted-foreground'>Page Views</p>
					<div className='text-2xl font-bold'>{totalViews.toLocaleString()}</div>
				</button>

				<button
					onClick={() => toggleSeries('emailCaptures')}
					className={cn(
						'rounded-lg border bg-card p-4 text-left transition-all hover:shadow-md',
						visibleSeries.emailCaptures ? 'border-green-500 bg-green-50' : 'opacity-60',
					)}
				>
					<p className='text-sm font-medium text-muted-foreground'>Email Captures</p>
					<div className='text-2xl font-bold'>{totalEmailCaptures.toLocaleString()}</div>
				</button>

				<button
					onClick={() => toggleSeries('downloads')}
					className={cn(
						'rounded-lg border bg-card p-4 text-left transition-all hover:shadow-md',
						visibleSeries.downloads ? 'border-purple-500 bg-purple-50' : 'opacity-60',
					)}
				>
					<p className='text-sm font-medium text-muted-foreground'>Downloads</p>
					<div className='text-2xl font-bold'>{totalDownloads.toLocaleString()}</div>
				</button>

				<div className='rounded-lg border bg-card p-4'>
					<p className='text-sm font-medium text-muted-foreground'>Conversion Rate</p>
					<div className='text-2xl font-bold'>{conversionRate}%</div>
					<p className='text-xs text-muted-foreground'>Emails / Views</p>
				</div>

				<div className='rounded-lg border bg-card p-4'>
					<p className='text-sm font-medium text-muted-foreground'>Download Rate</p>
					<div className='text-2xl font-bold'>{downloadRate}%</div>
					<p className='text-xs text-muted-foreground'>Downloads / Emails</p>
				</div>
			</div>

			{/* Add the timeseries chart */}
			<Card className='p-6'>
				{categories.length > 0 ?
					<AreaChart
						className='h-72'
						data={chartData}
						index='date'
						categories={categories}
						colors={colors}
						showXAxis={true}
						showLegend={true}
						curveType='linear'
						yAxisWidth={40}
						valueFormatter={v => nFormatter(v)}
					/>
				:	<div className='flex h-72 items-center justify-center text-muted-foreground'>
						Select at least one metric to display
					</div>
				}
			</Card>
		</div>
	);
}

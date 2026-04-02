'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Card } from '@barely/ui/card';
import { AreaChart } from '@barely/ui/charts/area-chart';
import { BarList } from '@barely/ui/charts/bar-list';
import { H, Text } from '@barely/ui/typography';

export function AdminOverviewCharts() {
	const trpc = useTRPC();

	const { data: userGrowth } = useSuspenseQuery(trpc.admin.userGrowth.queryOptions({}));
	const { data: wau } = useSuspenseQuery(
		trpc.admin.userActivityOverTime.queryOptions({}),
	);
	const { data: planDistribution } = useSuspenseQuery(
		trpc.admin.workspacesByPlan.queryOptions(),
	);
	const { data: topWorkspaces } = useSuspenseQuery(
		trpc.admin.topWorkspaces.queryOptions({ sortBy: 'events', limit: 10 }),
	);
	const { data: revenueTimeseries } = useSuspenseQuery(
		trpc.admin.revenueTimeseries.queryOptions({}),
	);
	const { data: signupSources } = useSuspenseQuery(
		trpc.admin.signupSources.queryOptions(),
	);
	const { data: appAnalytics } = useSuspenseQuery(
		trpc.admin.appAnalytics.queryOptions({}),
	);

	const userGrowthData = userGrowth.map(d => ({
		date: d.date,
		'New Users': d.count,
	}));

	const wauData = wau.map(d => ({
		date: d.week,
		'Active Users': d.activeUsers,
	}));

	const revenueData = revenueTimeseries.map(d => ({
		date: d.date,
		'Cart Sales': d.revenue / 100,
		Orders: d.orders,
	}));

	const planBarData = planDistribution
		.sort((a, b) => b.count - a.count)
		.map(d => ({
			name: d.plan,
			value: d.count,
		}));

	const topWorkspaceBarData = topWorkspaces.map(w => ({
		name: `${w.name} (${w.handle})`,
		value: w.value,
	}));

	const signupSourceBarData = signupSources.map(s => ({
		name: s.source,
		value: s.count,
	}));

	const dauData = appAnalytics.dau.map(d => ({
		date: d.date,
		'Active Users': d.activeUsers,
	}));

	const featureUsageBarData = appAnalytics.featureUsage.map(f => ({
		name: f.type.replace('app/', ''),
		value: f.eventCount,
	}));

	const pageViewBarData = appAnalytics.pageViews.slice(0, 15).map(p => ({
		name: p.pagePath,
		value: p.views,
	}));

	return (
		<div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
			<Card className='p-4'>
				<H size='6'>User Growth</H>
				{userGrowthData.length > 0 ?
					<AreaChart
						data={userGrowthData}
						index='date'
						categories={['New Users']}
						className='mt-4 h-48'
						showLegend={false}
					/>
				:	<Text muted className='mt-4'>
						No user data available
					</Text>
				}
			</Card>

			<Card className='p-4'>
				<H size='6'>Weekly Active Users</H>
				{wauData.length > 0 ?
					<AreaChart
						data={wauData}
						index='date'
						categories={['Active Users']}
						className='mt-4 h-48'
						showLegend={false}
					/>
				:	<Text muted className='mt-4'>
						No session data available
					</Text>
				}
			</Card>

			<Card className='p-4'>
				<H size='6'>Cart Sales Over Time</H>
				{revenueData.length > 0 ?
					<AreaChart
						data={revenueData}
						index='date'
						categories={['Cart Sales']}
						className='mt-4 h-48'
						showLegend={false}
						valueFormatter={v =>
							new Intl.NumberFormat('en-US', {
								style: 'currency',
								currency: 'USD',
								minimumFractionDigits: 0,
							}).format(v)
						}
					/>
				:	<Text muted className='mt-4'>
						No revenue data available
					</Text>
				}
			</Card>

			<Card className='p-4'>
				<H size='6'>Plan Distribution</H>
				{planBarData.length > 0 ?
					<BarList data={planBarData} className='mt-4' />
				:	<Text muted className='mt-4'>
						No workspace data available
					</Text>
				}
			</Card>

			<Card className='p-4'>
				<H size='6'>Top Workspaces by Events</H>
				{topWorkspaceBarData.length > 0 ?
					<BarList data={topWorkspaceBarData} className='mt-4' />
				:	<Text muted className='mt-4'>
						No activity data available
					</Text>
				}
			</Card>

			<Card className='p-4'>
				<H size='6'>Signup Sources</H>
				{signupSourceBarData.length > 0 ?
					<BarList data={signupSourceBarData} className='mt-4' />
				:	<Text muted className='mt-4'>
						No signup source data available
					</Text>
				}
			</Card>

			<Card className='p-4'>
				<H size='6'>App Daily Active Users</H>
				{dauData.length > 0 ?
					<AreaChart
						data={dauData}
						index='date'
						categories={['Active Users']}
						className='mt-4 h-48'
						showLegend={false}
					/>
				:	<Text muted className='mt-4'>
						No app analytics data yet
					</Text>
				}
			</Card>

			<Card className='p-4'>
				<H size='6'>Feature Usage</H>
				{featureUsageBarData.length > 0 ?
					<BarList data={featureUsageBarData} className='mt-4' />
				:	<Text muted className='mt-4'>
						No feature usage data yet
					</Text>
				}
			</Card>

			<Card className='p-4'>
				<H size='6'>Top Pages</H>
				{pageViewBarData.length > 0 ?
					<BarList data={pageViewBarData} className='mt-4' />
				:	<Text muted className='mt-4'>
						No page view data yet
					</Text>
				}
			</Card>
		</div>
	);
}

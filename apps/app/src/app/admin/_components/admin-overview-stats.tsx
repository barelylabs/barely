'use client';

import { nFormatter } from '@barely/utils';
import { useSuspenseQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { StatCard } from './stat-card';

function formatCurrency(cents: number) {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(cents / 100);
}

export function AdminOverviewStats() {
	const trpc = useTRPC();
	const { data } = useSuspenseQuery(trpc.admin.overview.queryOptions());
	const { data: activity } = useSuspenseQuery(trpc.admin.userActivity.queryOptions());

	return (
		<div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'>
			<StatCard label='Total Users' value={nFormatter(data.totalUsers)} />
			<StatCard
				label='Active Users'
				value={nFormatter(activity.activeUsers)}
				description='Last 30 days'
			/>
			<StatCard
				label='Setup Users'
				value={nFormatter(activity.setupUsers)}
				description='Created content'
			/>
			<StatCard
				label='Ghost Users'
				value={nFormatter(activity.ghostUsers)}
				description='No activity'
			/>
			<StatCard label='Total Workspaces' value={nFormatter(data.totalWorkspaces)} />
			<StatCard
				label='Paid Workspaces'
				value={nFormatter(data.paidWorkspaces)}
				description={`${data.totalWorkspaces > 0 ? Math.round((data.paidWorkspaces / data.totalWorkspaces) * 100) : 0}% conversion`}
			/>
			<StatCard label='MRR' value={formatCurrency(data.mrr)} />
			<StatCard label='Total Fans' value={nFormatter(data.totalFans)} />
			<StatCard label='Total Cart Sales' value={formatCurrency(data.totalRevenue)} />
			<StatCard
				label='Total Orders'
				value={nFormatter(data.totalOrders)}
				description={
					data.totalOrders > 0 ?
						`Avg ${formatCurrency(Math.round(data.totalRevenue / data.totalOrders))}`
					:	undefined
				}
			/>
			<StatCard label='Marketing Opt-ins' value={nFormatter(data.marketingOptIns)} />
		</div>
	);
}

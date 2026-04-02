'use client';

import type { PlanType } from '@barely/const';
import { useState } from 'react';
import { WORKSPACE_PLAN_TYPES } from '@barely/const';
import { nFormatter } from '@barely/utils';
import { useQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Badge } from '@barely/ui/badge';
import { Button } from '@barely/ui/button';
import { Icon } from '@barely/ui/icon';
import { Input } from '@barely/ui/input';
import { Text } from '@barely/ui/typography';

function isPlanType(value: string): value is PlanType {
	return (WORKSPACE_PLAN_TYPES as readonly string[]).includes(value);
}

const planBadgeVariant: Record<string, 'info' | 'success' | 'warning' | 'muted'> = {
	free: 'muted',
	bedroom: 'info',
	rising: 'success',
	breakout: 'warning',
	'bedroom.plus': 'info',
	'rising.plus': 'success',
	'breakout.plus': 'warning',
	'invoice.pro': 'info',
};

type SortBy = 'createdAt' | 'fanUsage' | 'eventUsage' | 'linkUsage' | 'orders';
type SortOrder = 'asc' | 'desc';

function SortableHeader({
	column,
	label,
	sortBy,
	sortOrder,
	onSort,
}: {
	column: SortBy;
	label: string;
	sortBy: SortBy;
	sortOrder: SortOrder;
	onSort: (column: SortBy) => void;
}) {
	const isActive = sortBy === column;
	return (
		<th
			className='cursor-pointer select-none p-3 text-left font-medium hover:text-foreground'
			onClick={() => onSort(column)}
		>
			<span className='flex items-center gap-1'>
				{label}
				{isActive ?
					sortOrder === 'desc' ?
						<Icon.sortDescending className='h-3.5 w-3.5' />
					:	<Icon.sortAscending className='h-3.5 w-3.5' />
				:	<Icon.chevronsUpDown className='h-3.5 w-3.5 opacity-30' />}
			</span>
		</th>
	);
}

export function AdminWorkspaceList() {
	const trpc = useTRPC();
	const [search, setSearch] = useState('');
	const [planFilter, setPlanFilter] = useState<PlanType | ''>('');
	const [cursor, setCursor] = useState(0);
	const [sortBy, setSortBy] = useState<SortBy>('createdAt');
	const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
	const limit = 20;

	const { data, isLoading } = useQuery(
		trpc.admin.recentWorkspaces.queryOptions({
			cursor,
			limit,
			search: search || undefined,
			planFilter: planFilter || undefined,
			sortBy,
			sortOrder,
		}),
	);

	function handleSort(column: SortBy) {
		if (sortBy === column) {
			setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
		} else {
			setSortBy(column);
			setSortOrder('desc');
		}
		setCursor(0);
	}

	return (
		<div className='flex flex-col gap-4'>
			<div className='flex gap-3'>
				<Input
					placeholder='Search workspaces...'
					value={search}
					onChange={e => {
						setSearch(e.target.value);
						setCursor(0);
					}}
					className='max-w-sm'
				/>
				<select
					value={planFilter}
					onChange={e => {
						const val = e.target.value;
						setPlanFilter(isPlanType(val) ? val : '');
						setCursor(0);
					}}
					className='rounded-md border bg-background px-3 py-2 text-sm'
				>
					<option value=''>All Plans</option>
					{WORKSPACE_PLAN_TYPES.map(plan => (
						<option key={plan} value={plan}>
							{plan}
						</option>
					))}
				</select>
			</div>

			<div className='overflow-x-auto rounded-md border'>
				<table className='w-full text-sm'>
					<thead>
						<tr className='border-b bg-muted/50'>
							<th className='p-3 text-left font-medium'>Name</th>
							<th className='p-3 text-left font-medium'>Handle</th>
							<th className='p-3 text-left font-medium'>Plan</th>
							<SortableHeader
								column='fanUsage'
								label='Fans'
								sortBy={sortBy}
								sortOrder={sortOrder}
								onSort={handleSort}
							/>
							<SortableHeader
								column='eventUsage'
								label='Events'
								sortBy={sortBy}
								sortOrder={sortOrder}
								onSort={handleSort}
							/>
							<SortableHeader
								column='linkUsage'
								label='Links'
								sortBy={sortBy}
								sortOrder={sortOrder}
								onSort={handleSort}
							/>
							<SortableHeader
								column='orders'
								label='Orders'
								sortBy={sortBy}
								sortOrder={sortOrder}
								onSort={handleSort}
							/>
							<SortableHeader
								column='createdAt'
								label='Created'
								sortBy={sortBy}
								sortOrder={sortOrder}
								onSort={handleSort}
							/>
						</tr>
					</thead>
					<tbody>
						{isLoading ?
							Array.from({ length: 5 }).map((_, i) => (
								<tr key={i} className='border-b'>
									<td colSpan={8} className='p-3'>
										<div className='h-4 animate-pulse rounded bg-muted' />
									</td>
								</tr>
							))
						: data?.workspaces.length === 0 ?
							<tr>
								<td colSpan={8} className='p-8 text-center'>
									<Text muted>No workspaces found</Text>
								</td>
							</tr>
						:	data?.workspaces.map(ws => (
								<tr key={ws.id} className='border-b'>
									<td className='p-3 font-medium'>{ws.name}</td>
									<td className='p-3'>
										<Text variant='sm/normal' muted>
											{ws.handle}
										</Text>
									</td>
									<td className='p-3'>
										<Badge variant={planBadgeVariant[ws.plan] ?? 'muted'} size='sm'>
											{ws.plan}
										</Badge>
									</td>
									<td className='p-3'>{nFormatter(ws.fanUsage)}</td>
									<td className='p-3'>{nFormatter(ws.eventUsage)}</td>
									<td className='p-3'>{nFormatter(ws.linkUsage)}</td>
									<td className='p-3'>{ws.orders}</td>
									<td className='p-3'>
										<Text variant='sm/normal' muted>
											{new Date(ws.createdAt).toLocaleDateString()}
										</Text>
									</td>
								</tr>
							))
						}
					</tbody>
				</table>
			</div>

			{data && data.total > 0 && (
				<div className='flex items-center justify-between'>
					<Text variant='sm/normal' muted>
						Showing {cursor + 1}-{Math.min(cursor + limit, data.total)} of {data.total}
					</Text>
					<div className='flex gap-2'>
						<Button
							look='outline'
							size='sm'
							disabled={cursor === 0}
							onClick={() => setCursor(Math.max(0, cursor - limit))}
						>
							Previous
						</Button>
						<Button
							look='outline'
							size='sm'
							disabled={data.nextCursor === null}
							onClick={() => {
								if (data.nextCursor !== null) setCursor(data.nextCursor);
							}}
						>
							Next
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}

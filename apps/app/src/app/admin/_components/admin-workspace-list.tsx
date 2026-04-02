'use client';

import type { PlanType } from '@barely/const';
import { useState } from 'react';
import { WORKSPACE_PLAN_TYPES } from '@barely/const';
import { nFormatter } from '@barely/utils';
import { useQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Badge } from '@barely/ui/badge';
import { Button } from '@barely/ui/button';
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

export function AdminWorkspaceList() {
	const trpc = useTRPC();
	const [search, setSearch] = useState('');
	const [planFilter, setPlanFilter] = useState<PlanType | ''>('');
	const [cursor, setCursor] = useState(0);
	const limit = 20;

	const { data, isLoading } = useQuery(
		trpc.admin.recentWorkspaces.queryOptions({
			cursor,
			limit,
			search: search || undefined,
			planFilter: planFilter || undefined,
		}),
	);

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
							<th className='p-3 text-left font-medium'>Fans</th>
							<th className='p-3 text-left font-medium'>Events</th>
							<th className='p-3 text-left font-medium'>Links</th>
							<th className='p-3 text-left font-medium'>Orders</th>
							<th className='p-3 text-left font-medium'>Created</th>
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

			{data && (
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

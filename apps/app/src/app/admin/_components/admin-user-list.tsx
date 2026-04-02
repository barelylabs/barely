'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Badge } from '@barely/ui/badge';
import { Button } from '@barely/ui/button';
import { Icon } from '@barely/ui/icon';
import { Input } from '@barely/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@barely/ui/select';
import { Text } from '@barely/ui/typography';

const activityOptions = [
	{ value: 'all', label: 'All Users' },
	{ value: 'active', label: 'Active' },
	{ value: 'setup', label: 'Setup' },
	{ value: 'ghost', label: 'Ghost' },
] as const;

function formatRelativeDate(date: Date | string | null) {
	if (!date) return 'Never';
	const d = new Date(date);
	const now = new Date();
	const diffMs = now.getTime() - d.getTime();
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays === 0) return 'Today';
	if (diffDays === 1) return 'Yesterday';
	if (diffDays < 7) return `${diffDays}d ago`;
	if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
	if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
	return `${Math.floor(diffDays / 365)}y ago`;
}

const activityBadgeVariant = {
	active: 'success',
	setup: 'info',
	ghost: 'muted',
} as const;

export function AdminUserList() {
	const trpc = useTRPC();
	const [search, setSearch] = useState('');
	const [cursor, setCursor] = useState(0);
	const [activityFilter, setActivityFilter] = useState<
		'all' | 'active' | 'setup' | 'ghost'
	>('all');
	const limit = 20;

	const { data, isLoading } = useQuery(
		trpc.admin.recentUsers.queryOptions({
			cursor,
			limit,
			search: search || undefined,
			activityFilter,
		}),
	);

	return (
		<div className='flex flex-col gap-4'>
			<div className='flex items-center gap-3'>
				<Input
					placeholder='Search users by name or email...'
					value={search}
					onChange={e => {
						setSearch(e.target.value);
						setCursor(0);
					}}
					className='max-w-sm'
				/>
				<Select
					value={activityFilter}
					onValueChange={v => {
						setActivityFilter(v as typeof activityFilter);
						setCursor(0);
					}}
				>
					<SelectTrigger className='w-[160px]'>
						<SelectValue placeholder='Filter by activity' />
					</SelectTrigger>
					<SelectContent>
						{activityOptions.map(opt => (
							<SelectItem key={opt.value} value={opt.value}>
								{opt.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className='overflow-x-auto rounded-md border'>
				<table className='w-full text-sm'>
					<thead>
						<tr className='border-b bg-muted/50'>
							<th className='p-3 text-left font-medium'>Name</th>
							<th className='p-3 text-left font-medium'>Email</th>
							<th className='p-3 text-left font-medium'>Status</th>
							<th className='p-3 text-left font-medium'>Last Login</th>
							<th className='p-3 text-left font-medium'>Logins</th>
							<th className='p-3 text-left font-medium'>Workspaces</th>
							<th className='p-3 text-left font-medium'>Source</th>
							<th className='p-3 text-left font-medium'>Role</th>
							<th className='p-3 text-left font-medium'>Joined</th>
						</tr>
					</thead>
					<tbody>
						{isLoading ?
							Array.from({ length: 5 }).map((_, i) => (
								<tr key={i} className='border-b'>
									<td colSpan={9} className='p-3'>
										<div className='h-4 animate-pulse rounded bg-muted' />
									</td>
								</tr>
							))
						: data?.users.length === 0 ?
							<tr>
								<td colSpan={9} className='p-8 text-center'>
									<Text muted>No users found</Text>
								</td>
							</tr>
						:	data?.users.map(user => (
								<tr key={user.id} className='border-b'>
									<td className='p-3'>
										<div className='flex items-center gap-1.5'>
											{user.fullName ??
												(`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || '-')}
											{user.marketing && (
												<Icon.email className='h-3.5 w-3.5 text-muted-foreground' />
											)}
										</div>
									</td>
									<td className='p-3'>
										<Text variant='sm/normal'>{user.email}</Text>
									</td>
									<td className='p-3'>
										<Badge variant={activityBadgeVariant[user.activityStatus]} size='sm'>
											{user.activityStatus}
										</Badge>
									</td>
									<td className='p-3'>
										<Text variant='sm/normal' muted>
											{formatRelativeDate(user.lastLoginAt)}
										</Text>
									</td>
									<td className='p-3'>{user.loginCount}</td>
									<td className='p-3'>{user.workspaceCount}</td>
									<td className='p-3'>
										<Text variant='sm/normal' muted>
											{user.signupSource ?? 'direct'}
										</Text>
									</td>
									<td className='p-3'>
										{user.admin && (
											<Badge variant='info' size='sm'>
												Admin
											</Badge>
										)}
									</td>
									<td className='p-3'>
										<Text variant='sm/normal' muted>
											{new Date(user.createdAt).toLocaleDateString()}
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

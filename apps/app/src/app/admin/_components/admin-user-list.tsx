'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Badge } from '@barely/ui/badge';
import { Button } from '@barely/ui/button';
import { Input } from '@barely/ui/input';
import { Text } from '@barely/ui/typography';

export function AdminUserList() {
	const trpc = useTRPC();
	const [search, setSearch] = useState('');
	const [cursor, setCursor] = useState(0);
	const limit = 20;

	const { data, isLoading } = useQuery(
		trpc.admin.recentUsers.queryOptions({
			cursor,
			limit,
			search: search || undefined,
		}),
	);

	return (
		<div className='flex flex-col gap-4'>
			<Input
				placeholder='Search users by name or email...'
				value={search}
				onChange={e => {
					setSearch(e.target.value);
					setCursor(0);
				}}
				className='max-w-sm'
			/>

			<div className='overflow-x-auto rounded-md border'>
				<table className='w-full text-sm'>
					<thead>
						<tr className='border-b bg-muted/50'>
							<th className='p-3 text-left font-medium'>Name</th>
							<th className='p-3 text-left font-medium'>Email</th>
							<th className='p-3 text-left font-medium'>Workspaces</th>
							<th className='p-3 text-left font-medium'>Role</th>
							<th className='p-3 text-left font-medium'>Joined</th>
						</tr>
					</thead>
					<tbody>
						{isLoading ?
							Array.from({ length: 5 }).map((_, i) => (
								<tr key={i} className='border-b'>
									<td colSpan={5} className='p-3'>
										<div className='h-4 animate-pulse rounded bg-muted' />
									</td>
								</tr>
							))
						: data?.users.length === 0 ?
							<tr>
								<td colSpan={5} className='p-8 text-center'>
									<Text muted>No users found</Text>
								</td>
							</tr>
						:	data?.users.map(user => (
								<tr key={user.id} className='border-b'>
									<td className='p-3'>
										{user.fullName ??
											(`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || '-')}
									</td>
									<td className='p-3'>
										<Text variant='sm/normal'>{user.email}</Text>
									</td>
									<td className='p-3'>{user.workspaceCount}</td>
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

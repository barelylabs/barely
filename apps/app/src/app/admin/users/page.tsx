import { Suspense } from 'react';

import { H } from '@barely/ui/typography';

import { HydrateClient, prefetch, trpc } from '~/trpc/server';
import { AdminUserList } from '../_components/admin-user-list';

export default function AdminUsersPage() {
	prefetch(trpc.admin.recentUsers.queryOptions({ cursor: 0, limit: 20 }));

	return (
		<HydrateClient>
			<div className='flex flex-col gap-6'>
				<H size='5'>Users</H>

				<Suspense
					fallback={<div className='h-96 animate-pulse rounded-md border-2 bg-muted' />}
				>
					<AdminUserList />
				</Suspense>
			</div>
		</HydrateClient>
	);
}

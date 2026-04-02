import { Suspense } from 'react';

import { H } from '@barely/ui/typography';

import { HydrateClient, prefetch, trpc } from '~/trpc/server';
import { AdminWorkspaceList } from '../_components/admin-workspace-list';

export default function AdminWorkspacesPage() {
	prefetch(trpc.admin.recentWorkspaces.queryOptions({ cursor: 0, limit: 20 }));

	return (
		<HydrateClient>
			<div className='flex flex-col gap-6'>
				<H size='5'>Workspaces</H>

				<Suspense
					fallback={<div className='h-96 animate-pulse rounded-md border-2 bg-muted' />}
				>
					<AdminWorkspaceList />
				</Suspense>
			</div>
		</HydrateClient>
	);
}

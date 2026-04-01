import { Suspense } from 'react';

import { GridListSkeleton } from '@barely/ui/components/grid-list-skeleton';

import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { PressKitForm } from '~/app/[handle]/press/_components/press-kit-form';
import { HydrateClient, prefetch, trpc } from '~/trpc/server';

export default async function PressKitPage({
	params,
}: {
	params: Promise<{ handle: string }>;
}) {
	const { handle } = await params;
	prefetch(trpc.pressKit.byWorkspace.queryOptions({ handle }));
	prefetch(trpc.mixtape.byWorkspace.infiniteQueryOptions({ handle }));

	// prefetching to match selectable media params
	prefetch(
		trpc.file.byWorkspace.infiniteQueryOptions({
			handle,
			search: '',
			limit: 10,
			types: ['image'],
		}),
	);

	return (
		<HydrateClient>
			<DashContentHeader title='Press Kit' />
			<DashContent>
				<Suspense fallback={<GridListSkeleton />}>
					<Suspense fallback={<GridListSkeleton />}>
						<PressKitForm />
					</Suspense>
				</Suspense>
			</DashContent>
		</HydrateClient>
	);
}

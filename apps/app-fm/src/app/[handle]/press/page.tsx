import { Suspense } from 'react';

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
			<Suspense fallback={<div>Loading...</div>}>
				<DashContentHeader title='Press Kit' />
				<Suspense fallback={'Loading...'}>
					<PressKitForm />
				</Suspense>
			</Suspense>
		</HydrateClient>
	);
}

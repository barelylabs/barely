import { Suspense } from 'react';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { PressKitForm } from '~/app/[handle]/press/_components/press-kit-form';
import { HydrateClient, prefetch, trpc } from '~/trpc/server';

export default async function PressKitPage({ params }: { params: Promise<{ handle: string }> }) {
	const { handle } = await params;
	prefetch(trpc.pressKit.byWorkspace.queryOptions({ handle }));

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

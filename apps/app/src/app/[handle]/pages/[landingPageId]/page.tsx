import { Suspense } from 'react';

import { UpdateLandingPageForm } from '~/app/[handle]/pages/[landingPageId]/_components/update-landing-page-form';
import { HydrateClient, prefetch, trpc } from '~/trpc/server';

export default async function LandingPagePage({
	params,
}: {
	params: Promise<{ handle: string; landingPageId: string }>;
}) {
	const { handle, landingPageId } = await params;

	// Prefetch data (not async - don't await)
	prefetch(trpc.landingPage.byId.queryOptions({ handle, landingPageId }));

	return (
		<HydrateClient>
			<Suspense fallback={<div>Loading page...</div>}>
				<UpdateLandingPageForm />
			</Suspense>
		</HydrateClient>
	);
}

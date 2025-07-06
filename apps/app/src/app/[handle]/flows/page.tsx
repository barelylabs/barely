import type { z } from 'zod/v4';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { flowSearchParamsSchema } from '@barely/validators';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllFlows } from '~/app/[handle]/flows/_components/all-flows';
import { CreateFlowButton } from '~/app/[handle]/flows/_components/create-flow-button';
import { HydrateClient, prefetch, trpc } from '~/trpc/server';

export default async function FlowsPage({
	params,
	searchParams,
}: {
	params: Promise<{ handle: string }>;
	searchParams: Promise<z.infer<typeof flowSearchParamsSchema>>;
}) {
	const awaitedParams = await params;
	const awaitedSearchParams = await searchParams;
	const parsedFilters = flowSearchParamsSchema.safeParse(awaitedSearchParams);
	if (!parsedFilters.success) {
		console.log('parsedFilters error', parsedFilters.error);
		redirect(`/${awaitedParams.handle}/flows`);
	}

	prefetch(
		trpc.flow.byWorkspace.infiniteQueryOptions({
			handle: awaitedParams.handle,
			...parsedFilters.data,
		}),
	);

	return (
		<HydrateClient>
			<DashContentHeader title='Flows' button={<CreateFlowButton />} />
			<Suspense fallback={<div>Loading...</div>}>
				<AllFlows />
			</Suspense>
		</HydrateClient>
	);
}

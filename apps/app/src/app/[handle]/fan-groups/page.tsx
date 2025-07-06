import type { z } from 'zod/v4';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { fanGroupSearchParamsSchema } from '@barely/validators';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllFanGroups } from '~/app/[handle]/fan-groups/_components/all-fan-groups';
import { ArchiveOrDeleteFanGroupModal } from '~/app/[handle]/fan-groups/_components/archive-or-delete-fan-group-modal';
import { CreateFanGroupButton } from '~/app/[handle]/fan-groups/_components/create-fan-group-button';
import { CreateOrUpdateFanGroupModal } from '~/app/[handle]/fan-groups/_components/create-or-update-fan-group-modal';
import { FanGroupFilters } from '~/app/[handle]/fan-groups/_components/fan-group-filters';
import { FanGroupHotkeys } from '~/app/[handle]/fan-groups/_components/fan-group-hotkeys';
import { HydrateClient, prefetch, trpc } from '~/trpc/server';

export default async function FanGroupsPage({
	params,
	searchParams,
}: {
	params: Promise<{ handle: string }>;
	searchParams: Promise<z.infer<typeof fanGroupSearchParamsSchema>>;
}) {
	const awaitedParams = await params;
	const awaitedSearchParams = await searchParams;
	const parsedFilters = fanGroupSearchParamsSchema.safeParse(awaitedSearchParams);
	if (!parsedFilters.success) {
		console.log('parsedFilters error', parsedFilters.error);
		redirect(`/${awaitedParams.handle}/fan-groups`);
	}

	prefetch(
		trpc.fanGroup.byWorkspace.infiniteQueryOptions({
			handle: awaitedParams.handle,
			...parsedFilters.data,
		}),
	);

	return (
		<HydrateClient>
			<DashContentHeader title='Fan Groups' button={<CreateFanGroupButton />} />
			<FanGroupFilters />
			<Suspense fallback={<div>Loading...</div>}>
				<AllFanGroups />
			</Suspense>

			<CreateOrUpdateFanGroupModal mode='create' />
			<CreateOrUpdateFanGroupModal mode='update' />

			<ArchiveOrDeleteFanGroupModal mode='archive' />
			<ArchiveOrDeleteFanGroupModal mode='delete' />

			<FanGroupHotkeys />
		</HydrateClient>
	);
}

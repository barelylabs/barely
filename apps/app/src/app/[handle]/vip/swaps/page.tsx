import type { z } from 'zod/v4';
import { Suspense } from 'react';
import { vipSwapSearchParamsSchema } from '@barely/validators';

import { GridListSkeleton } from '@barely/ui/components/grid-list-skeleton';

import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { ArchiveOrDeleteVipSwapModal } from '~/app/[handle]/vip/swaps/_components/archive-or-delete-vip-swap-modal';
import { CreateOrUpdateVipSwapModal } from '~/app/[handle]/vip/swaps/_components/create-or-update-vip-swap-modal';
import { CreateVipSwapButton } from '~/app/[handle]/vip/swaps/_components/create-vip-swap-button';
import { HydrateClient, prefetch, trpc } from '~/trpc/server';
import { AllVipSwaps } from './_components/all-vip-swaps';
import { VipDialogs } from './_components/vip-dialogs';
import { VipFilters } from './_components/vip-filters';
import { VipHotkeys } from './_components/vip-hotkeys';

export default async function VipPage({
	params,
	searchParams,
}: {
	params: Promise<{ handle: string }>;
	searchParams: Promise<z.infer<typeof vipSwapSearchParamsSchema>>;
}) {
	const { handle } = await params;
	const rawFilters = await searchParams;

	const parsedFilters = vipSwapSearchParamsSchema.safeParse(rawFilters);
	const filters = parsedFilters.success ? parsedFilters.data : {};

	// Prefetch data on server
	prefetch(
		trpc.vipSwap.byWorkspace.infiniteQueryOptions({
			handle,
			...filters,
		}),
	);

	return (
		<HydrateClient>
			<DashContentHeader title='Swaps' button={<CreateVipSwapButton />} />
			<DashContent>
				<VipDialogs />
				<VipFilters />

				<Suspense fallback={<GridListSkeleton />}>
					<AllVipSwaps />

					<CreateOrUpdateVipSwapModal mode='create' />
					<CreateOrUpdateVipSwapModal mode='update' />
					<ArchiveOrDeleteVipSwapModal mode='archive' />
					<ArchiveOrDeleteVipSwapModal mode='delete' />

					<VipHotkeys />
				</Suspense>
			</DashContent>
		</HydrateClient>
	);
}

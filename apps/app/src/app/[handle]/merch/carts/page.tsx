import type { z } from 'zod/v4';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { cartFunnelSearchParamsSchema } from '@barely/validators';

import { GridListSkeleton } from '@barely/ui/components/grid-list-skeleton';

import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllCartFunnels } from '~/app/[handle]/merch/carts/_components/all-cartFunnels';
import { ArchiveOrDeleteFunnelModal } from '~/app/[handle]/merch/carts/_components/archive-or-delete-cartFunnel-modal';
import { CartDialogs } from '~/app/[handle]/merch/carts/_components/cart-dialogs';
import { CartFunnelFilters } from '~/app/[handle]/merch/carts/_components/cartFunnel-filters';
import { CartFunnelHotkeys } from '~/app/[handle]/merch/carts/_components/cartFunnel-hotkeys';
import { CreateCartFunnelButton } from '~/app/[handle]/merch/carts/_components/create-cartFunnel-button';
import { CreateOrUpdateFunnelModal } from '~/app/[handle]/merch/carts/_components/create-or-update-cartFunnel-modal';
import { HydrateClient, prefetch, trpc } from '~/trpc/server';

export default async function CartFunnelsPage({
	params,
	searchParams,
}: {
	params: Promise<{ handle: string }>;
	searchParams: Promise<z.infer<typeof cartFunnelSearchParamsSchema>>;
}) {
	const awaitedParams = await params;
	const awaitedSearchParams = await searchParams;
	const parsedFilters = cartFunnelSearchParamsSchema.safeParse(awaitedSearchParams);
	if (!parsedFilters.success) {
		redirect(`/${awaitedParams.handle}/merch/carts`);
	}

	prefetch(
		trpc.cartFunnel.byWorkspace.queryOptions({
			handle: awaitedParams.handle,
			...parsedFilters.data,
		}),
	);

	return (
		<HydrateClient>
			<DashContentHeader title='Carts' button={<CreateCartFunnelButton />} />
			<DashContent>
				<CartDialogs />

				<CartFunnelFilters />
				<Suspense fallback={<GridListSkeleton />}>
					<AllCartFunnels />

					<CreateOrUpdateFunnelModal mode='create' />
					<CreateOrUpdateFunnelModal mode='update' />

					<ArchiveOrDeleteFunnelModal mode='archive' />
					<ArchiveOrDeleteFunnelModal mode='delete' />

					<CartFunnelHotkeys />
				</Suspense>
			</DashContent>
		</HydrateClient>
	);
}

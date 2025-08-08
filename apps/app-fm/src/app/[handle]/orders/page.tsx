import type { z } from 'zod/v4';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { cartOrderSearchParamsSchema } from '@barely/validators';

import { GridListSkeleton } from '@barely/ui/components/grid-list-skeleton';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllCartOrders } from '~/app/[handle]/orders/_components/all-cart-orders';
import { CancelCartOrderModal } from '~/app/[handle]/orders/_components/cancel-cart-order-modal';
import { CartOrderFilters } from '~/app/[handle]/orders/_components/cart-order-filters';
import { CartOrderHotkeys } from '~/app/[handle]/orders/_components/cart-order-hotkeys';
import { MarkCartOrderFulfilledModal } from '~/app/[handle]/orders/_components/mark-cart-order-fulfilled-modal';
import { HydrateClient, prefetch, trpc } from '~/trpc/server';

export default async function CartOrdersPage({
	params,
	searchParams,
}: {
	params: Promise<{ handle: string }>;
	searchParams: Promise<z.infer<typeof cartOrderSearchParamsSchema>>;
}) {
	const { handle } = await params;
	const filters = await searchParams;

	const parsedFilters = cartOrderSearchParamsSchema.safeParse(filters);
	if (!parsedFilters.success) {
		console.error('Failed to parse search params', parsedFilters.error);
		redirect(`/${handle}/orders`);
	}

	prefetch(
		trpc.cartOrder.byWorkspace.infiniteQueryOptions({
			handle,
			...parsedFilters.data,
		}),
	);

	return (
		<HydrateClient>
			<DashContentHeader title='Orders' />

			<CartOrderFilters />
			<Suspense fallback={<GridListSkeleton />}>
				<AllCartOrders />

				<MarkCartOrderFulfilledModal />
				<CancelCartOrderModal />
				<CartOrderHotkeys />
			</Suspense>
		</HydrateClient>
	);
}

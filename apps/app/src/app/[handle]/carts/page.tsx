import type { z } from 'zod';
import { redirect } from 'next/navigation';
import { api } from '@barely/lib/server/api/server';
import { cartFunnelSearchParamsSchema } from '@barely/lib/server/routes/cart-funnel/cart-funnel.schema';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllCartFunnels } from '~/app/[handle]/carts/_components/all-cart-funnels';
import { ArchiveOrDeleteFunnelModal } from '~/app/[handle]/carts/_components/archive-or-delete-funnel-modal';
import { CartFunnelContextProvider } from '~/app/[handle]/carts/_components/cart-funnel-context';
import { CartFunnelHotkeys } from '~/app/[handle]/carts/_components/cart-funnel-hotkeys';
import { CreateCartFunnelButton } from '~/app/[handle]/carts/_components/create-cart-funnel-button';
import { CreateOrUpdateFunnelModal } from '~/app/[handle]/carts/_components/create-or-update-cart-funnel-modal';

export default function CartFunnelsPage({
	params,
	searchParams,
}: {
	params: { handle: string };
	searchParams: z.infer<typeof cartFunnelSearchParamsSchema>;
}) {
	const parsedFilters = cartFunnelSearchParamsSchema.safeParse(searchParams);
	if (!parsedFilters.success) {
		redirect(`/${params.handle}/funnels`);
	}

	const { selectedFunnelIds, ...filters } = parsedFilters.data;
	const funnels = api({ handle: params.handle }).cartFunnel.byWorkspace({
		handle: params.handle,
		...filters,
	});

	return (
		<CartFunnelContextProvider
			initialFunnels={funnels}
			filters={filters}
			selectedFunnelIds={selectedFunnelIds ?? []}
		>
			<DashContentHeader title='Carts' button={<CreateCartFunnelButton />} />

			<AllCartFunnels />

			<CreateOrUpdateFunnelModal mode='create' />
			<CreateOrUpdateFunnelModal mode='update' />

			<ArchiveOrDeleteFunnelModal mode='archive' />
			<ArchiveOrDeleteFunnelModal mode='delete' />

			<CartFunnelHotkeys />
		</CartFunnelContextProvider>
	);
}

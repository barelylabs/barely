import type { z } from 'zod';
import { redirect } from 'next/navigation';
import { api } from '@barely/lib/server/api/server.edge';
import { cartFunnelSearchParamsSchema } from '@barely/lib/server/cart-funnel.schema';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllFunnels } from '~/app/[handle]/carts/_components/all-cart-funnels';
import { ArchiveOrDeleteFunnelModal } from '~/app/[handle]/carts/_components/archive-or-delete-funnel-modal';
import { CartFunnelContextProvider } from '~/app/[handle]/carts/_components/cart-funnel-context';
import { CreateCartFunnelButton } from '~/app/[handle]/carts/_components/create-cart-funnel-button';
import { CreateOrUpdateFunnelModal } from '~/app/[handle]/carts/_components/create-or-update-funnel-modal';

export default function CartFunnelsPage({
	params,
	searchParams,
}: {
	params: { handle: string };
	searchParams: z.infer<typeof cartFunnelSearchParamsSchema>;
}) {
	const parsedFilters = cartFunnelSearchParamsSchema.safeParse(searchParams);
	if (!parsedFilters.success) {
		console.log(parsedFilters.error.errors);
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

			<AllFunnels />

			<CreateOrUpdateFunnelModal mode='create' />
			<CreateOrUpdateFunnelModal mode='update' />

			<ArchiveOrDeleteFunnelModal mode='archive' />
			<ArchiveOrDeleteFunnelModal mode='delete' />

			{/* <FunnelHotkeys /> */}
			{/* <UpgradeModal checkoutCancelPath="carts" checkoutSuccessPath="carts" /> */}
		</CartFunnelContextProvider>
	);
}

import type { z } from 'zod/v4';
import { redirect } from 'next/navigation';
import { api } from '@barely/lib/server/api/server';
import { cartFunnelSearchParamsSchema } from '@barely/lib/server/routes/cart-funnel/cart-funnel.schema';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllCartFunnels } from '~/app/[handle]/carts/_components/all-cartFunnels';
import { ArchiveOrDeleteFunnelModal } from '~/app/[handle]/carts/_components/archive-or-delete-cartFunnel-modal';
import { CartDialogs } from '~/app/[handle]/carts/_components/cart-dialogs';
import { CartFunnelContextProvider } from '~/app/[handle]/carts/_components/cartFunnel-context';
import { CartFunnelFilters } from '~/app/[handle]/carts/_components/cartFunnel-filters';
import { CartFunnelHotkeys } from '~/app/[handle]/carts/_components/cartFunnel-hotkeys';
import { CreateCartFunnelButton } from '~/app/[handle]/carts/_components/create-cartFunnel-button';
import { CreateOrUpdateFunnelModal } from '~/app/[handle]/carts/_components/create-or-update-cartFunnel-modal';

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
		redirect(`/${awaitedParams.handle}/funnels`);
	}

	const infiniteCartFunnels = api({
		handle: awaitedParams.handle,
	}).cartFunnel.byWorkspace({
		handle: awaitedParams.handle,
		...parsedFilters.data,
	});

	return (
		<CartFunnelContextProvider initialInfiniteCartFunnels={infiniteCartFunnels}>
			<DashContentHeader
				title='Carts'
				settingsHref={`/${awaitedParams.handle}/settings/cart`}
				button={<CreateCartFunnelButton />}
			/>

			<CartDialogs />

			<CartFunnelFilters />
			<AllCartFunnels />

			<CreateOrUpdateFunnelModal mode='create' />
			<CreateOrUpdateFunnelModal mode='update' />

			<ArchiveOrDeleteFunnelModal mode='archive' />
			<ArchiveOrDeleteFunnelModal mode='delete' />

			<CartFunnelHotkeys />
		</CartFunnelContextProvider>
	);
}

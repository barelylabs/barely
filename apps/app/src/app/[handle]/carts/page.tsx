import type { z } from 'zod';
import { redirect } from 'next/navigation';
import { api } from '@barely/lib/server/api/server';
import { cartFunnelSearchParamsSchema } from '@barely/lib/server/routes/cart-funnel/cart-funnel.schema';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllCartFunnels } from '~/app/[handle]/carts/_components/all-cartFunnels';
import { ArchiveOrDeleteFunnelModal } from '~/app/[handle]/carts/_components/archive-or-delete-cartFunnel-modal';
import { CartDialogs } from '~/app/[handle]/carts/_components/cart-dialogs';
import { CartFunnelContextProvider } from '~/app/[handle]/carts/_components/cartFunnel-context';
import { CartFunnelHotkeys } from '~/app/[handle]/carts/_components/cartFunnel-hotkeys';
import { CreateCartFunnelButton } from '~/app/[handle]/carts/_components/create-cartFunnel-button';
import { CreateOrUpdateFunnelModal } from '~/app/[handle]/carts/_components/create-or-update-cartFunnel-modal';

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

	const infiniteCartFunnels = api({ handle: params.handle }).cartFunnel.byWorkspace({
		handle: params.handle,
		...parsedFilters.data,
	});

	return (
		<CartFunnelContextProvider initialInfiniteCartFunnels={infiniteCartFunnels}>
			<DashContentHeader
				title='Carts'
				settingsHref={`/${params.handle}/settings/cart`}
				button={<CreateCartFunnelButton />}
			/>

			<CartDialogs />

			<AllCartFunnels />

			<CreateOrUpdateFunnelModal mode='create' />
			<CreateOrUpdateFunnelModal mode='update' />

			<ArchiveOrDeleteFunnelModal mode='archive' />
			<ArchiveOrDeleteFunnelModal mode='delete' />

			<CartFunnelHotkeys />
		</CartFunnelContextProvider>
	);
}

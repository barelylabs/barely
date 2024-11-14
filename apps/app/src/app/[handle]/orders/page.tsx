import type { z } from 'zod';
import { redirect } from 'next/navigation';
import { api } from '@barely/lib/server/api/server';
import { cartOrderSearchParamsSchema } from '@barely/lib/server/routes/cart-order/cart-order.schema';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllCartOrders } from '~/app/[handle]/orders/_components/all-cart-orders';
import { CartOrderContextProvider } from '~/app/[handle]/orders/_components/cart-order-context';
import { CartOrderFilters } from '~/app/[handle]/orders/_components/cart-order-filters';
import { CartOrderHotkeys } from '~/app/[handle]/orders/_components/cart-order-hotkeys';
import { MarkCartOrderFulfilledModal } from '~/app/[handle]/orders/_components/mark-cart-order-fulfilled-modal';

export default function CartOrdersPage({
	params,
	searchParams,
}: {
	params: { handle: string };
	searchParams: z.infer<typeof cartOrderSearchParamsSchema>;
}) {
	const parsedFilters = cartOrderSearchParamsSchema.safeParse(searchParams);
	if (!parsedFilters.success) {
		console.error('Failed to parse search params', parsedFilters.error);
		redirect(`/${params.handle}/orders`);
	}

	const initialInfiniteOrders = api({ handle: params.handle }).cartOrder.byWorkspace({
		handle: params.handle,
		...parsedFilters.data,
	});

	return (
		<CartOrderContextProvider initialInfiniteOrders={initialInfiniteOrders}>
			<DashContentHeader title='Orders' />

			<CartOrderFilters />
			<AllCartOrders />
			{/* <div className='grid grid-cols-1 gap-5 md:grid-cols-[auto,1fr]'>
			</div> */}

			<MarkCartOrderFulfilledModal />
			<CartOrderHotkeys />
		</CartOrderContextProvider>
	);
}

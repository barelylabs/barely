import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { cartStatFiltersSchema } from '@barely/hooks';
import type { z } from 'zod/v4';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { StatBarelyReferers } from '~/app/[handle]/_components/stat-barely-referers';
import { StatDevices } from '~/app/[handle]/_components/stat-devices';
import { StatExternalReferers } from '~/app/[handle]/_components/stat-external-referers';
import { StatLocations } from '~/app/[handle]/_components/stat-locations';
import { CartStatHeader } from '~/app/[handle]/carts/stats/cart-stat-header';
import { CartTimeseries } from '~/app/[handle]/carts/stats/cart-timeseries';
import { HydrateClient, prefetch, trpc } from '~/trpc/server';

export default async function CartStatsPage({
	params,
	searchParams,
}: {
	params: Promise<{ handle: string }>;
	searchParams: Promise<z.infer<typeof cartStatFiltersSchema>>;
}) {
	const { handle } = await params;
	const filters = await searchParams;
	
	const parsedFilters = cartStatFiltersSchema.safeParse(filters);
	if (!parsedFilters.success) {
		console.log('parsedFilters error', parsedFilters.error);
		redirect(`/${handle}/carts/stats`);
	}

	prefetch(
		trpc.stat.cartTimeseries.queryOptions({
			handle,
			...parsedFilters.data,
		}),
	);

	return (
		<HydrateClient>
			<DashContentHeader title='Cart Stats' />
			<CartStatHeader />
			<CartTimeseries />

			<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
				<Suspense fallback={<div>Loading...</div>}>
					<StatLocations eventType='cart/viewCheckout' />
					<StatDevices eventType='cart/viewCheckout' />
					<StatExternalReferers eventType='cart/viewCheckout' />
					<StatBarelyReferers eventType='cart/viewCheckout' />
				</Suspense>
			</div>
		</HydrateClient>
	);
}

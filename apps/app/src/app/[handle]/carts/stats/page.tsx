import type { z } from 'zod/v4';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { log } from '@barely/lib/utils/log';
import { cartStatFiltersSchema } from '@barely/validators';

import { DashContent } from '~/app/[handle]/_components/dash-content';
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
		await log({
			message: `parsedFilters error, ${JSON.stringify(parsedFilters.error)}`,
			type: 'errors',
			location: 'CartStatsPage',
		});
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
			<DashContent>
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
			</DashContent>
		</HydrateClient>
	);
}

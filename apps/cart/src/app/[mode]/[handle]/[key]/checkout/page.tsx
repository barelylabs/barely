import type { z } from 'zod/v4';
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { log } from '@barely/lib/utils/log';
import { cartPageSearchParams } from '@barely/validators';

import { ElementsProvider } from '~/app/[mode]/[handle]/[key]/_components/elements-provider';
import { HydrateClient, prefetch, trpc } from '~/trpc/server';
import { CheckoutForm, OrderSummary } from './checkout-form';

export default async function CartPage({
	params,
	searchParams,
}: {
	params: Promise<{
		mode: 'preview' | 'live';
		handle: string;
		key: string;
	}>;
	searchParams: Promise<z.infer<typeof cartPageSearchParams>>;
}) {
	const { mode, handle, key } = await params;
	const cartParams = cartPageSearchParams.safeParse(await searchParams);

	if (!cartParams.success) {
		await log({
			location: 'cart/app/[mode]/[handle]/[key]/checkout/page.tsx',
			message: `cartParams error: ${cartParams.error.message}`,
			type: 'errors',
		});
		return redirect('/');
	}

	/* we have landing pages call warmup to get around cold start */
	if (cartParams.data.warmup) {
		return <div>warming up</div>;
	}

	// this should always be available via the middleware
	const cartId = (await cookies()).get(`${handle}.${key}.cartId`)?.value;

	if (!cartId) {
		await log({
			location: 'cart/app/[mode]/[handle]/[key]/checkout/page.tsx',
			message: `cartId not found for ${handle}.${key}`,
			type: 'errors',
		});
		return redirect('/');
	}

	prefetch(trpc.publicFunnelByHandleAndKey.queryOptions({ handle, key }));
	prefetch(trpc.byIdAndParams.queryOptions({ id: cartId, handle, key }));

	return (
		<HydrateClient>
			<div className='grid min-h-svh grid-cols-1 gap-4 sm:grid-cols-[5fr_4fr]'>
				<div className='flex w-full flex-grow flex-col items-center bg-brandKit-bg p-8 text-brandKit-text sm:items-end sm:p-12'>
					<ElementsProvider
						stage='checkoutCreated'
						cartId={cartId}
						handle={handle}
						cartKey={key}
					>
						<CheckoutForm mode={mode} cartId={cartId} handle={handle} cartKey={key} />
					</ElementsProvider>
				</div>
				<div className='flex w-full flex-col bg-brandKit-block p-8 text-brandKit-block-text sm:sticky sm:top-0 sm:h-svh sm:p-12'>
					<Suspense fallback={<div>Loading...</div>}>
						<OrderSummary cartId={cartId} handle={handle} cartKey={key} />
					</Suspense>
				</div>
			</div>
		</HydrateClient>
	);
}

import type { z } from 'zod';
import { Suspense } from 'react';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cartApi } from '@barely/lib/server/routes/cart/cart.api.server';
import { cartPageSearchParams } from '@barely/lib/server/routes/cart/cart.schema';
import { isDevelopment } from '@barely/lib/utils/environment';

import { ElementsProvider } from '~/app/[mode]/[handle]/[funnelKey]/_components/elements-provider';
import { CheckoutForm } from './checkout-form';

export default async function CartPage({
	params,
	searchParams,
}: {
	params: {
		mode: 'preview' | 'live';
		handle: string;
		funnelKey: string;
	};
	searchParams: z.infer<typeof cartPageSearchParams>;
}) {
	const { mode, handle, funnelKey } = params;

	const headersList = headers();

	const cartParams = cartPageSearchParams.safeParse(searchParams);

	if (!cartParams.success) {
		console.log('cartParams error', cartParams.error);
		return redirect('/');
	}

	const cartId = cookies().get(`${handle}.${funnelKey}.cartId`)?.value;

	console.log('checkoutPageServer >> ip', headersList.get('x-vercel-ip'));
	console.log('checkoutPageServer >> forwardedFor', headersList.get('x-forwarded-for'));

	const shipTo = {
		country: isDevelopment() ? 'US' : headersList.get('x-vercel-ip-country'),
		state: isDevelopment() ? 'NY' : headersList.get('x-vercel-ip-country-region'),
		city: isDevelopment() ? 'New York' : headersList.get('x-vercel-ip-city'),
	};
	console.log('checkoutPageServer >> initialShipTo', shipTo);

	console.log('checkoutPageServer >> userAgent', headersList.get('user-agent'));
	console.log('checkoutPageServer >> device', headersList.get('device'));
	console.log('checkoutPageServer >> browser', headersList.get('browser'));
	console.log(
		'checkoutPageServer >> all headers',
		Object.fromEntries(headersList.entries()),
	);

	const initialData =
		cartId ?
			cartApi.byIdAndParams({ id: cartId, handle, funnelKey })
		:	cartApi.create({
				handle,
				funnelKey,
				shipTo,
				landingPageId: cartParams.data.landingPageId,
			});

	return (
		<>
			<Suspense fallback={<LoadingSkeleton />}>
				<ElementsProvider stage='checkoutCreated' initialData={initialData}>
					<CheckoutForm
						mode={mode}
						initialData={initialData}
						shouldWriteToCookie={!cartId}
					/>
				</ElementsProvider>
			</Suspense>
		</>
	);
}

function LoadingSkeleton() {
	return (
		<div className='grid min-h-svh grid-cols-1 gap-4 sm:grid-cols-[5fr_4fr]'>
			<div className='flex w-full flex-grow flex-col items-center bg-background p-8 sm:items-end sm:p-12'></div>
			<div className='flex w-full flex-col bg-brand p-8 sm:min-h-svh sm:p-12'></div>
		</div>
	);
}

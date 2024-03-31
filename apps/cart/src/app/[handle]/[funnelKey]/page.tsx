import type { z } from 'zod';
import { Suspense } from 'react';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cartApi } from '@barely/lib/server/routes/cart/cart.api.server';
import { cartPageSearchParams } from '@barely/lib/server/routes/cart/cart.schema';
import { isDevelopment } from '@barely/lib/utils/environment';

import { ElementsProvider } from '~/app/[handle]/[funnelKey]/_components/elements-provider';
import { MainCartForm } from './main-cart-form';

export default function CartPage({
	params,
	searchParams,
}: {
	params: {
		handle: string;
		funnelKey: string;
	};
	searchParams: z.infer<typeof cartPageSearchParams>;
}) {
	const { handle, funnelKey } = params;

	const headersList = headers();

	const cartParams = cartPageSearchParams.safeParse(searchParams);

	if (!cartParams.success) {
		console.log('cartParams', cartParams.error);
		return redirect('/');
	}

	const cartId = cookies().get(`${handle}.${funnelKey}.cartId`)?.value;

	const initialData = cartId
		? cartApi.getByIdAndFunnelKey({ id: cartId, handle, funnelKey })
		: cartApi.createByFunnelKey({
				handle,
				funnelKey,
				shipTo: {
					country: isDevelopment() ? 'US' : headersList.get('x-vercel-ip-country'),
					state: isDevelopment() ? 'NY' : headersList.get('x-vercel-ip-country-region'),
					city: isDevelopment() ? 'New York' : headersList.get('x-vercel-ip-city'),
				},
			});

	return (
		<>
			<Suspense fallback={<p>Loading...</p>}>
				<ElementsProvider stage='mainCreated' initialData={initialData}>
					<MainCartForm initialData={initialData} shouldWriteToCookie={!cartId} />
				</ElementsProvider>
			</Suspense>
		</>
	);
}
import type { z } from 'zod';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cartApi } from '@barely/lib/server/routes/cart/cart.api.server';
import { cartPageSearchParams } from '@barely/lib/server/routes/cart/cart.schema';
import { isDevelopment } from '@barely/lib/utils/environment';
import { getDynamicStyleVariables } from 'node_modules/@barely/tailwind-config/lib/dynamic-tw.runtime';

import { ElementsProvider } from '~/app/[mode]/[handle]/[key]/_components/elements-provider';
import { CheckoutForm } from './checkout-form';

export default async function CartPage({
	params,
	searchParams,
}: {
	params: {
		mode: 'preview' | 'live';
		handle: string;
		key: string;
	};
	searchParams: z.infer<typeof cartPageSearchParams>;
}) {
	const { mode, handle, key } = params;

	const cartParams = cartPageSearchParams.safeParse(searchParams);

	if (!cartParams.success) {
		console.log('cartParams error', cartParams.error);
		return redirect('/');
	}

	const cartId = cookies().get(`${handle}.${key}.cartId`)?.value;

	//  estimate shipTo from IP
	const headersList = headers();
	const shipTo = {
		country: isDevelopment() ? 'US' : headersList.get('x-vercel-ip-country'),
		state: isDevelopment() ? 'NY' : headersList.get('x-vercel-ip-country-region'),
		city: isDevelopment() ? 'New York' : headersList.get('x-vercel-ip-city'),
	};

	const initialData =
		cartId ?
			await cartApi.byIdAndParams({ id: cartId, handle, key })
		:	await cartApi.create({
				handle,
				key,
				shipTo,
				landingPageId: cartParams.data.landingPageId,
			});

	const { defaultHex: colorPrimary } = getDynamicStyleVariables({
		baseName: 'brand',
		hue: initialData.publicFunnel.workspace.brandHue,
	});

	return (
		<>
			<ElementsProvider
				stage='checkoutCreated'
				initialData={initialData}
				theme={{ colorPrimary }}
			>
				<CheckoutForm
					mode={mode}
					initialData={initialData}
					shouldWriteToCookie={!cartId}
				/>
			</ElementsProvider>
		</>
	);
}

// function LoadingSkeleton() {
// 	return (
// 		<div className='grid min-h-svh grid-cols-1 gap-4 sm:grid-cols-[5fr_4fr]'>
// 			<div className='flex w-full flex-grow flex-col items-center bg-background p-8 sm:items-end sm:p-12'></div>
// 			<div className='flex w-full flex-col bg-brand p-8 sm:min-h-svh sm:p-12'></div>
// 		</div>
// 	);
// }

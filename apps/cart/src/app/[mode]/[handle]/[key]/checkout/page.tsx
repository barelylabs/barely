import type { z } from 'zod';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cartApi } from '@barely/lib/server/routes/cart/cart.api.server';
import { cartPageSearchParams } from '@barely/lib/server/routes/cart/cart.schema';
// import { eventReportSearchParamsSchema } from '@barely/lib/server/routes/event/event-report.schema';
import { isDevelopment } from '@barely/lib/utils/environment';
import { log } from '@barely/lib/utils/log';
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

	console.log('cartParams', cartParams.data);

	if (cartParams.data.warmup) {
		return <div>warming up</div>;
	}

	const cartId = cookies().get(`${handle}.${key}.cartId`)?.value;
	// const cartStage = cookies().get(`${handle}.${key}.cartStage`)?.value;

	await log({
		type: 'logs',
		location: 'checkout page',
		message: `checkout page loaded. cartId: ${cartId}`,
		mention: true,
	});

	//  estimate shipTo from IP
	const headersList = headers();
	const shipTo = {
		country: isDevelopment() ? 'US' : headersList.get('x-vercel-ip-country'),
		state: isDevelopment() ? 'NY' : headersList.get('x-vercel-ip-country-region'),
		city: isDevelopment() ? 'New York' : headersList.get('x-vercel-ip-city'),
	};

	console.log('checkoutcartId', cartId);
	// console.log('checkout cartStage', cartStage);

	const initialData =
		cartId ?
			await cartApi.byIdAndParams({ id: cartId, handle, key })
		:	await cartApi.create({
				handle,
				key,
				shipTo,
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
				<CheckoutForm mode={mode} initialData={initialData} />
			</ElementsProvider>
		</>
	);
}

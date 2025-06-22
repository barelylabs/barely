import type { z } from 'zod/v4';
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
		console.log('cartParams error', cartParams.error);
		await log({
			location: 'cart/app/[mode]/[handle]/[key]/checkout/page.tsx',
			message: `cartParams error: ${cartParams.error.message}`,
			type: 'errors',
		});
		return redirect('/');
	}

	if (cartParams.data.warmup) {
		return <div>warming up</div>;
	}

	const cartId = (await cookies()).get(`${handle}.${key}.cartId`)?.value;

	//  estimate shipTo from IP
	const headersList = await headers();
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

import type { z } from 'zod/v4';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { log } from '@barely/lib/utils/log';
import { isDevelopment } from '@barely/utils';
import { cartPageSearchParams } from '@barely/validators';
import { getDynamicStyleVariables } from 'node_modules/@barely/tailwind-config/lib/dynamic-tw.runtime';

import { ElementsProvider } from '~/app/[mode]/[handle]/[key]/_components/elements-provider';
import { HydrateClient, prefetch, trpc, trpcCaller } from '~/trpc/server';
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

	/* we have landing pages call warmup to get around cold start */
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

	const { cart, publicFunnel } =
		cartId ?
			await trpcCaller.byIdAndParams({ id: cartId, handle, key })
		:	await trpcCaller.create({
				handle,
				key,
				shipTo,
			});
	// todo: 👆 get publicFunnel from upstash cache for faster initial rendering

	const { defaultHex: colorPrimary } = getDynamicStyleVariables({
		baseName: 'brand',
		hue: publicFunnel.workspace.brandHue,
	});

	prefetch(trpc.byIdAndParams.queryOptions({ id: cart.id, handle, key }));
	// todo: 👆 better to just set the data here instead of prefetching. we should already have it.

	return (
		<HydrateClient>
			<ElementsProvider
				stage='checkoutCreated'
				initialData={{ cart, publicFunnel }}
				theme={{ colorPrimary }}
			>
				<CheckoutForm mode={mode} publicFunnel={publicFunnel} cartId={cart.id} />
			</ElementsProvider>
		</HydrateClient>
	);
}

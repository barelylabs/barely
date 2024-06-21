import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cartApi } from '@barely/lib/server/routes/cart/cart.api.server';

import { Img } from '@barely/ui/elements/img';
import { H } from '@barely/ui/elements/typography';

import { CartMDX } from '~/app/[mode]/[handle]/[key]/_components/cart-mdx';
import { ProductPrice } from '~/app/[mode]/[handle]/[key]/_components/product-price';
import { CartSteps } from '~/app/[mode]/[handle]/[key]/(after-main)/customize/_components/cart-steps';
import { UpsellButtons } from '~/app/[mode]/[handle]/[key]/(after-main)/customize/_components/upsell-buttons';
import { UpsellCountdown } from '~/app/[mode]/[handle]/[key]/(after-main)/customize/_components/upsell-countdown';

export default async function UpsellPage({
	params,
}: {
	params: { mode: 'preview' | 'live'; handle: string; key: string };
}) {
	const { mode, handle, key } = params;

	const cartId = cookies().get(`${params.handle}.${params.key}.cartId`)?.value;

	if (!cartId) {
		console.log('cartId not found');
		return null;
	}

	const { cart, publicFunnel } = await cartApi.byIdAndParams({
		id: cartId,
		handle,
		key,
	});

	if (!cart) {
		console.log('cart not found');
		return null;
	}

	// log a success checkout conversion event >> we do this in the stripe webhook now
	// await cartApi.logEvent({
	// 	cartId,
	// 	event: cart.addedBump ? 'cart_purchaseMainWithBump' : 'cart_purchaseMainWithoutBump',
	// });

	if (
		mode === 'live' &&
		(cart.stage === 'checkoutConverted' ||
			cart.stage === 'upsellConverted' ||
			cart.stage === 'upsellDeclined')
	) {
		return redirect(`/${handle}/${key}/success`);
	}

	const expiresAt =
		(cart.checkoutConvertedAt ? cart.checkoutConvertedAt.getTime() : Date.now()) +
		5 * 60 * 1000; // 5 minutes from now
	// 10 * 1000; // 10 seconds from now

	const normalPrice = publicFunnel.upsellProduct?.price;
	const price =
		(publicFunnel.upsellProduct?.price ?? 0) - (publicFunnel.upsellProductDiscount ?? 0);

	return (
		<>
			<div className='flex flex-col items-center gap-6 sm:gap-8'>
				<CartSteps />

				<H size='1' className='text-center'>
					{publicFunnel.upsellProductHeadline}
				</H>

				<UpsellCountdown
					mode={mode}
					handle={handle}
					key={key}
					cartId={cartId}
					expiresAt={expiresAt}
				/>
			</div>

			<div className='flex flex-col items-center gap-6'>
				<Img
					src={publicFunnel.upsellProduct?._images[0]?.file.src ?? ''}
					alt={publicFunnel.upsellProduct?.name ?? ''}
					width={1000}
					height={1000}
					className='mx-auto h-auto w-full max-w-[300px] rounded-lg sm:max-w-[400px]'
				/>

				{publicFunnel.upsellProductAboveTheFold && (
					<CartMDX markdown={publicFunnel.upsellProductAboveTheFold} />
				)}

				<ProductPrice price={price} normalPrice={normalPrice} variant='xl/bold' />

				<UpsellButtons mode={mode} handle={handle} key={key} cartId={cartId} />
			</div>

			{publicFunnel.upsellProductBelowTheFold && (
				<>
					<CartMDX markdown={publicFunnel.upsellProductBelowTheFold} />
					<UpsellButtons mode={mode} handle={handle} key={key} cartId={cartId} />
				</>
			)}
		</>
	);
}

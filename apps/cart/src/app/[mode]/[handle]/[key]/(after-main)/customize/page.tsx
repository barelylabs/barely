import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cartApi } from '@barely/lib/server/routes/cart/cart.api.server';
import { APPAREL_SIZES } from '@barely/lib/server/routes/product/product.constants';

import { Img } from '@barely/ui/elements/img';
import { H } from '@barely/ui/elements/typography';

import { CartMDX } from '~/app/[mode]/[handle]/[key]/_components/cart-mdx';
import { ProductPrice } from '~/app/[mode]/[handle]/[key]/_components/product-price';
import { CartSteps } from '~/app/[mode]/[handle]/[key]/(after-main)/customize/_components/cart-steps';
import { UpsellButtons } from '~/app/[mode]/[handle]/[key]/(after-main)/customize/_components/upsell-buttons';
import { UpsellCountdown } from '~/app/[mode]/[handle]/[key]/(after-main)/customize/_components/upsell-countdown';
import { UpsellLog } from '~/app/[mode]/[handle]/[key]/(after-main)/customize/_components/upsell-log';

export default async function UpsellPage({
	params,
}: {
	params: { mode: 'preview' | 'live'; handle: string; key: string };
}) {
	const { mode, handle, key } = params;

	const cartId = cookies().get(`${params.handle}.${params.key}.cartId`)?.value;
	// const cartStage = cookies().get(`${params.handle}.${params.key}.cartStage`)?.value;

	// if (cartStage !== 'checkoutCreated') {
	// 	cookies().set(`${params.handle}.${params.key}.cartStage`, 'upsellCreated');
	// }

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

	if (
		mode === 'live' &&
		(cart.stage === 'checkoutConverted' ||
			cart.stage === 'upsellConverted' ||
			cart.stage === 'upsellDeclined')
	) {
		// cookies().set(`${handle}.${key}.cartStage`, cart.stage);
		return redirect(`/${handle}/${key}/success`);
	}

	// cookies().set(`${handle}.${key}.cartStage`, 'upsellCreated');

	const expiresAt =
		(cart.checkoutConvertedAt ? cart.checkoutConvertedAt.getTime() : Date.now()) +
		5 * 60 * 1000; // 5 minutes from now

	const normalPrice = publicFunnel.upsellProduct?.price;
	const price =
		(publicFunnel.upsellProduct?.price ?? 0) - (publicFunnel.upsellProductDiscount ?? 0);

	const upsellSizes = publicFunnel.upsellProduct?._apparelSizes
		?.map(size => size.size)
		.sort((a, b) => {
			const order = APPAREL_SIZES;
			return order.indexOf(a) - order.indexOf(b);
		});

	return (
		<>
			<UpsellLog cartId={cartId} handle={handle} key={key} />
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
					s3Key={publicFunnel.upsellProduct?._images[0]?.file.s3Key ?? ''}
					blurDataURL={publicFunnel.upsellProduct?._images[0]?.file.blurDataUrl ?? ''}
					alt={publicFunnel.upsellProduct?.name ?? ''}
					width={1000}
					height={1000}
					className='mx-auto h-auto w-full max-w-[300px] rounded-lg sm:max-w-[400px]'
				/>

				{publicFunnel.upsellProductAboveTheFold && (
					<CartMDX markdown={publicFunnel.upsellProductAboveTheFold} />
				)}

				<ProductPrice price={price} normalPrice={normalPrice} variant='xl/bold' />

				<UpsellButtons
					mode={mode}
					handle={handle}
					key={key}
					cartId={cartId}
					upsellSizes={upsellSizes}
				/>
			</div>

			{publicFunnel.upsellProductBelowTheFold && (
				<>
					<CartMDX markdown={publicFunnel.upsellProductBelowTheFold} />
					<UpsellButtons
						mode={mode}
						handle={handle}
						key={key}
						cartId={cartId}
						upsellSizes={upsellSizes}
					/>
				</>
			)}
		</>
	);
}

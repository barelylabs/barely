import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { APPAREL_SIZES } from '@barely/const';
import { getAmountsForUpsell } from '@barely/lib/functions/cart.utils';

import { Img } from '@barely/ui/img';
import { ProductPrice } from '@barely/ui/src/components/cart/product-price';
import { H } from '@barely/ui/typography';

import { CartMDX } from '~/app/[mode]/[handle]/[key]/_components/cart-mdx';
import { CartSteps } from '~/app/[mode]/[handle]/[key]/(after-main)/customize/_components/cart-steps';
import { UpsellButtons } from '~/app/[mode]/[handle]/[key]/(after-main)/customize/_components/upsell-buttons';
import { UpsellCountdown } from '~/app/[mode]/[handle]/[key]/(after-main)/customize/_components/upsell-countdown';
import { UpsellLog } from '~/app/[mode]/[handle]/[key]/(after-main)/customize/_components/upsell-log';
import { trpcCaller } from '~/trpc/server';

export default async function UpsellPage({
	params,
}: {
	params: Promise<{ mode: 'preview' | 'live'; handle: string; key: string }>;
}) {
	const { mode, handle, key } = await params;

	const awaitedParams = await params;
	const cartId = (await cookies()).get(
		`${awaitedParams.handle}.${awaitedParams.key}.cartId`,
	)?.value;
	// const cartStage = cookies().get(`${params.handle}.${params.key}.cartStage`)?.value;

	// if (cartStage !== 'checkoutCreated') {
	// 	cookies().set(`${params.handle}.${params.key}.cartStage`, 'upsellCreated');
	// }

	if (!cartId) {
		console.log('cartId not found');
		return null;
	}

	const { cart, publicFunnel } = await trpcCaller.byIdAndParams({
		id: cartId,
		handle,
		key,
	});

	// if (!cart) {
	// 	console.log('cart not found');
	// 	return null;
	// }

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

	const amounts = getAmountsForUpsell(publicFunnel, cart);

	// const price = Math.max(
	// 	0,
	// 	(publicFunnel.upsellProduct?.price ?? 0) - (publicFunnel.upsellProductDiscount ?? 0),
	// );

	const upsellSizes = publicFunnel.upsellProduct?._apparelSizes
		.map(size => size.size)
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

				<ProductPrice
					price={amounts.upsellProductPrice}
					normalPrice={normalPrice}
					variant='xl/bold'
				/>

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

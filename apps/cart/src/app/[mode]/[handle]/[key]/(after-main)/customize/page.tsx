import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// import { APPAREL_SIZES } from '@barely/const';
// import { getAmountsForUpsell } from '@barely/lib/functions/cart.utils';

import { Img } from '@barely/ui/img';
import { H } from '@barely/ui/typography';

import { CartMDX } from '~/app/[mode]/[handle]/[key]/_components/cart-mdx';
import { CartSteps } from '~/app/[mode]/[handle]/[key]/(after-main)/customize/_components/cart-steps';
import { UpsellButtons } from '~/app/[mode]/[handle]/[key]/(after-main)/customize/_components/upsell-buttons';
import { UpsellCountdown } from '~/app/[mode]/[handle]/[key]/(after-main)/customize/_components/upsell-countdown';
import { UpsellLog } from '~/app/[mode]/[handle]/[key]/(after-main)/customize/_components/upsell-log';
import { UpsellProductPrice } from '~/app/[mode]/[handle]/[key]/(after-main)/customize/_components/upsell-product-price';
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

	if (!cartId) {
		console.log('cartId not found');
		return null;
	}

	// we could prefetch/stream this to the client, but for now
	// we're just gonna grab it before rendering. Suspense for the apparel
	// size buttons is a little awkward. But this could be modified in the future.
	const publicFunnel = await trpcCaller.publicFunnelByHandleAndKey({ handle, key });

	// Redirect to success if no upsell product is configured
	if (!publicFunnel.upsellProduct) {
		redirect(`/${mode}/${handle}/${key}/success`);
	}

	// const { cart } = await trpcCaller.byIdAndParams({
	// 	id: cartId,
	// 	handle,
	// 	key,
	// });

	// if (
	// 	mode === 'live' &&
	// 	(cart.stage === 'checkoutConverted' ||
	// 		cart.stage === 'upsellConverted' ||
	// 		cart.stage === 'upsellDeclined')
	// )
	// 	return redirect(`/${handle}/${key}/success`);

	// const expiresAt =
	// 	(cart.checkoutConvertedAt ? cart.checkoutConvertedAt.getTime() : Date.now()) +
	// 	5 * 60 * 1000; // 5 minutes from now

	// const normalPrice = publicFunnel.upsellProduct?.price;

	// const amounts = getAmountsForUpsell(publicFunnel, cart);

	// const upsellSizes = publicFunnel.upsellProduct?._apparelSizes
	// 	.map(size => size.size)
	// 	.sort((a, b) => {
	// 		const order = APPAREL_SIZES;
	// 		return order.indexOf(a) - order.indexOf(b);
	// 	});

	return (
		<div className='flex flex-col gap-6 pb-12'>
			<UpsellLog mode={mode} cartId={cartId} handle={handle} cartKey={key} />
			<div className='flex flex-col items-center gap-6 sm:gap-8'>
				<CartSteps />

				<H size='3' className='text-center'>
					{publicFunnel.upsellProductHeadline}
				</H>

				<UpsellCountdown mode={mode} handle={handle} cartKey={key} cartId={cartId} />
			</div>

			<div className='flex flex-col items-center gap-6'>
				{/* Product Image */}
				<Img
					s3Key={publicFunnel.upsellProduct?._images[0]?.file.s3Key ?? ''}
					blurDataURL={publicFunnel.upsellProduct?._images[0]?.file.blurDataUrl ?? ''}
					alt={publicFunnel.upsellProduct?.name ?? ''}
					width={600}
					height={600}
					className='mx-auto h-auto w-full max-w-[300px] rounded-lg sm:max-h-[400px]'
				/>

				{publicFunnel.upsellProductAboveTheFold && (
					<CartMDX markdown={publicFunnel.upsellProductAboveTheFold} />
				)}

				<Suspense fallback={<div>Loading...</div>}>
					<UpsellProductPrice
						handle={handle}
						cartKey={key}
						cartId={cartId}
						publicFunnel={publicFunnel}
					/>
				</Suspense>

				<Suspense fallback={null}>
					<UpsellButtons
						mode={mode}
						handle={handle}
						cartKey={key}
						cartId={cartId}
						publicFunnel={publicFunnel}
					/>
				</Suspense>
			</div>

			{publicFunnel.upsellProductBelowTheFold && (
				<>
					<CartMDX markdown={publicFunnel.upsellProductBelowTheFold} />
					<Suspense fallback={null}>
						<UpsellButtons
							mode={mode}
							handle={handle}
							cartKey={key}
							cartId={cartId}
							publicFunnel={publicFunnel}
						/>
					</Suspense>
				</>
			)}
		</div>
	);
}

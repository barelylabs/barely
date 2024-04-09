import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cartApi } from '@barely/lib/server/routes/cart/cart.api.server';

import { Img } from '@barely/ui/elements/img';
import { H } from '@barely/ui/elements/typography';

import { CartMDX } from '~/app/[handle]/[funnelKey]/_components/cart-mdx';
import { ProductPrice } from '~/app/[handle]/[funnelKey]/_components/product-price';
import { CartSteps } from '~/app/[handle]/[funnelKey]/(after-main)/customize/_components/cart-steps';
import { UpsellButtons } from '~/app/[handle]/[funnelKey]/(after-main)/customize/_components/upsell-buttons';
import { UpsellCountdown } from '~/app/[handle]/[funnelKey]/(after-main)/customize/_components/upsell-countdown';

export default async function UpsellPage({
	params,
}: {
	params: { handle: string; funnelKey: string };
}) {
	const { handle, funnelKey } = params;

	const cartId = cookies().get(`${params.handle}.${params.funnelKey}.cartId`)?.value;

	if (!cartId) return null;

	const { cart, funnel } = await cartApi.byIdAndParams({
		id: cartId,
		handle,
		funnelKey,
	});

	if (!cart) return null;

	if (
		cart.stage === 'mainConverted' ||
		cart.stage === 'upsellConverted' ||
		cart.stage === 'upsellDeclined'
	) {
		return redirect(`/${handle}/${funnelKey}/success`);
	}

	const expiresAt =
		(cart.upsellCreatedAt ? cart.upsellCreatedAt.getTime() : Date.now()) + 5 * 60 * 1000; // 5 minutes from now

	const normalPrice = funnel.upsellProduct?.price;
	const price = (funnel.upsellProduct?.price ?? 0) - (funnel.upsellProductDiscount ?? 0);

	return (
		<>
			<div className='flex flex-col items-center gap-6 sm:gap-8'>
				<CartSteps />

				<H size='1' className='text-center'>
					{funnel.upsellProductHeadline}
				</H>

				<UpsellCountdown cartId={cartId} expiresAt={expiresAt} />
			</div>

			<div className='flex flex-col items-center gap-6'>
				<Img
					src={funnel.upsellProduct?._images[0]?.file.src ?? ''}
					alt={funnel.upsellProduct?.name ?? ''}
					width={1000}
					height={1000}
					className='mx-auto h-auto w-full max-w-[300px] rounded-lg sm:max-w-[400px]'
				/>

				{funnel.upsellProductAboveTheFold && (
					<CartMDX markdown={funnel.upsellProductAboveTheFold} />
				)}

				<ProductPrice price={price} normalPrice={normalPrice} variant='xl/bold' />

				<UpsellButtons cartId={cartId} />
			</div>

			{funnel.upsellProductBelowTheFold && (
				<>
					<CartMDX markdown={funnel.upsellProductBelowTheFold} />
					<UpsellButtons cartId={cartId} />
				</>
			)}
		</>
	);
}

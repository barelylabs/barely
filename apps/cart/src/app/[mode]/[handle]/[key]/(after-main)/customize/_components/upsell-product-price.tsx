'use client';

import type { PublicFunnel } from '@barely/lib/functions/cart.fns';
import { getAmountsForUpsell } from '@barely/lib/functions/cart.utils';

import { ProductPrice } from '@barely/ui/src/components/cart/product-price';

import { useCart } from '~/app/[mode]/[handle]/[key]/_components/use-cart';

export function UpsellProductPrice({
	handle,
	key,
	cartId,
	publicFunnel,
}: {
	handle: string;
	key: string;
	cartId: string;
	publicFunnel: PublicFunnel;
}) {
	const { cart } = useCart({
		id: cartId,
		handle,
		key,
	});
	const amounts = getAmountsForUpsell(publicFunnel, cart);

	return (
		<ProductPrice
			price={amounts.upsellProductAmount}
			normalPrice={amounts.upsellProductPrice}
			variant='xl/bold'
		/>
	);
}

'use client';

import type { PublicFunnel } from '@barely/lib/functions/cart.fns';
import { getAmountsForUpsell, getVatRateForCheckout } from '@barely/lib/utils/cart';

import { ProductPrice } from '@barely/ui/src/components/cart/product-price';
import { Text } from '@barely/ui/typography';

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
	const vat = getVatRateForCheckout(
		publicFunnel.workspace.shippingAddressCountry,
		cart.shippingAddressCountry,
	);
	const amounts = getAmountsForUpsell(publicFunnel, cart, vat);

	return (
		<div className='flex flex-col gap-1'>
			<ProductPrice
				price={amounts.upsellProductAmount}
				normalPrice={amounts.upsellProductPrice}
				variant='xl/bold'
				currency={publicFunnel.workspace.currency}
			/>
			<Text variant='sm/normal'>excl 20% VAT</Text>
		</div>
	);
}

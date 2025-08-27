'use client';

import { Countdown } from '@barely/ui/countdown';

import { useUpsellCart } from '~/app/[mode]/[handle]/[key]/(after-main)/customize/_components/use-upsell-cart';

export function UpsellCountdown({
	mode,
	handle,
	key,
	cartId,
}: {
	mode: 'preview' | 'live';
	handle: string;
	key: string;
	cartId: string;
}) {
	const { cart, handleDeclineUpsell } = useUpsellCart({ mode, handle, key, cartId });

	const expiresAt =
		(cart.checkoutConvertedAt ? cart.checkoutConvertedAt.getTime() : Date.now()) +
		5 * 60 * 1000; // 5 minutes from now

	return (
		<Countdown
			date={expiresAt}
			onComplete={handleDeclineUpsell}
			showZeroMinutes
			className='text-brandKit-block'
			timesUpMessage='Offer expired!'
		/>
	);
}

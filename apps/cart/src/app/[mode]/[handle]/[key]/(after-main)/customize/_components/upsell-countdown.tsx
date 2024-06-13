'use client';

import { Countdown } from '@barely/ui/elements/countdown';

import { useUpsellCart } from '~/app/[mode]/[handle]/[key]/(after-main)/customize/_components/use-upsell-cart';

export function UpsellCountdown({
	mode,
	handle,
	key,
	cartId,
	expiresAt,
}: {
	mode: 'preview' | 'live';
	handle: string;
	key: string;
	cartId: string;
	expiresAt: number;
}) {
	const { handleDeclineUpsell } = useUpsellCart({ mode, handle, key, cartId });

	return (
		<Countdown
			date={expiresAt}
			onComplete={handleDeclineUpsell}
			showZeroMinutes
			className='text-brand'
			timesUpMessage='Offer expired!'
		/>
	);
}

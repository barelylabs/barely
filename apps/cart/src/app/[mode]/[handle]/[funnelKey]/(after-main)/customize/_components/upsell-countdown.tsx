'use client';

import { Countdown } from '@barely/ui/elements/countdown';

import { useUpsellCart } from '~/app/[mode]/[handle]/[funnelKey]/(after-main)/customize/_components/use-upsell-cart';

export function UpsellCountdown({
	mode,
	handle,
	funnelKey,
	cartId,
	expiresAt,
}: {
	mode: 'preview' | 'live';
	handle: string;
	funnelKey: string;
	cartId: string;
	expiresAt: number;
}) {
	const { handleDeclineUpsell } = useUpsellCart({ mode, handle, funnelKey, cartId });

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

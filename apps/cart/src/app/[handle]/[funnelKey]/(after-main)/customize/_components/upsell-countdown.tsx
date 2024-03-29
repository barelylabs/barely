'use client';

import { Countdown } from '@barely/ui/elements/countdown';

import { useUpsellCart } from '~/app/[handle]/[funnelKey]/(after-main)/customize/_components/use-upsell-cart';

export function UpsellCountdown({
	cartId,
	expiresAt,
}: {
	cartId: string;
	expiresAt: number;
}) {
	const { handleDeclineUpsell } = useUpsellCart({ cartId });

	return (
		<Countdown
			date={expiresAt}
			onComplete={handleDeclineUpsell}
			showZeroMinutes
			className='text-brand'
		/>
	);
}

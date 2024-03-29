'use client';

import { Button } from '@barely/ui/elements/button';

import { useUpsellCart } from '~/app/[handle]/[funnelKey]/(after-main)/customize/_components/use-upsell-cart';

export function UpsellButtons({ cartId }: { cartId: string }) {
	const { submitting, handleBuyUpsell, handleDeclineUpsell } = useUpsellCart({ cartId });

	return (
		<div className='flex w-full flex-col gap-4'>
			<Button
				onClick={handleBuyUpsell}
				size='xl'
				loading={submitting}
				disabled={submitting}
				look='brand'
				fullWidth
			>
				Use same payment method
			</Button>
			<Button look='link' onClick={handleDeclineUpsell} disabled={submitting}>
				No thanks
			</Button>
		</div>
	);
}

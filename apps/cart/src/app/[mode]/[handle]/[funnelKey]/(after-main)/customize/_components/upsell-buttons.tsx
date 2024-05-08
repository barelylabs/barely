'use client';

import { Button } from '@barely/ui/elements/button';

import { useUpsellCart } from '~/app/[mode]/[handle]/[funnelKey]/(after-main)/customize/_components/use-upsell-cart';

export function UpsellButtons({
	mode,
	handle,
	funnelKey,
	cartId,
}: {
	mode: 'preview' | 'live';
	handle: string;
	funnelKey: string;
	cartId: string;
}) {
	const { converting, declining, submitting, handleBuyUpsell, handleDeclineUpsell } =
		useUpsellCart({
			mode,
			handle,
			funnelKey,
			cartId,
		});

	return (
		<div className='flex w-full flex-col gap-4'>
			<Button
				onClick={handleBuyUpsell}
				size='xl'
				loading={converting}
				disabled={submitting}
				loadingText='Using same payment method...'
				look='brand'
				fullWidth
			>
				Use same payment method
			</Button>
			<Button
				look='link'
				onClick={handleDeclineUpsell}
				disabled={submitting}
				loading={declining}
			>
				No thanks
			</Button>
		</div>
	);
}

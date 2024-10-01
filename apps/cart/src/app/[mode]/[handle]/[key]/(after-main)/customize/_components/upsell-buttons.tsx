'use client';

import type { ApparelSize } from '@barely/lib/server/routes/product/product.constants';
import { useState } from 'react';
import { APPAREL_SIZES } from '@barely/lib/server/routes/product/product.constants';

import { Button } from '@barely/ui/elements/button';
import { ToggleGroup, ToggleGroupItem } from '@barely/ui/elements/toggle-group';

import { useUpsellCart } from '~/app/[mode]/[handle]/[key]/(after-main)/customize/_components/use-upsell-cart';

export function UpsellButtons({
	mode,
	handle,
	key,
	cartId,
	upsellSizes,
}: {
	mode: 'preview' | 'live';
	handle: string;
	key: string;
	cartId: string;
	upsellSizes?: ApparelSize[];
}) {
	const [apparelSize, setApparelSize] = useState<ApparelSize | undefined>(undefined);

	const { converting, declining, submitting, handleBuyUpsell, handleDeclineUpsell } =
		useUpsellCart({
			mode,
			handle,
			key,
			cartId,
			apparelSize,
		});

	const convertUpsellDisabled =
		(upsellSizes && !apparelSize) ?? converting ?? submitting ?? declining;
	const declineUpsellDisabled = converting || declining || submitting;

	return (
		<div className='flex w-full flex-col items-center gap-4'>
			{upsellSizes && upsellSizes.length > 0 && (
				<div className='flex w-full max-w-[300px] flex-col gap-4'>
					<ToggleGroup
						type='single'
						size='md'
						className='grid grid-cols-3'
						value={apparelSize ?? ''}
						onValueChange={size => {
							console.log(size);
							if (APPAREL_SIZES.includes(size as ApparelSize)) {
								console.log('setting to ', size);
								return setApparelSize(size as ApparelSize);
							}
							setApparelSize(undefined);
						}}
					>
						{upsellSizes.map(size => (
							<ToggleGroupItem
								variant='outline'
								value={size}
								key={size}
								aria-label={`Toggle ${size}`}
								className='data-[state=on]:bg-brand hover:bg-brand/90'
							>
								{size}
							</ToggleGroupItem>
						))}
					</ToggleGroup>
				</div>
			)}
			<Button
				onClick={handleBuyUpsell}
				size='xl'
				loading={converting}
				disabled={convertUpsellDisabled}
				loadingText='Using same payment method...'
				look='brand'
				fullWidth
			>
				{upsellSizes && !apparelSize ? 'Select size' : 'Use same payment method'}
			</Button>
			<Button
				look='link'
				onClick={handleDeclineUpsell}
				disabled={declineUpsellDisabled}
				loading={declining}
			>
				No thanks
			</Button>
		</div>
	);
}

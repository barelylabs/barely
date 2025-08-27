'use client';

import type { ApparelSize } from '@barely/const';
import type { PublicFunnel } from '@barely/lib/functions/cart.fns';
import { useState } from 'react';
import { APPAREL_SIZES } from '@barely/const';

import { Button } from '@barely/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@barely/ui/toggle-group';

import { useUpsellCart } from '~/app/[mode]/[handle]/[key]/(after-main)/customize/_components/use-upsell-cart';

export function UpsellButtons({
	mode,
	handle,
	key,
	cartId,
	publicFunnel,
	// upsellSizes,
}: {
	mode: 'preview' | 'live';
	handle: string;
	key: string;
	cartId: string;
	publicFunnel: PublicFunnel;
	// upsellSizes?: ApparelSize[];
}) {
	// const { publicFunnel } = usePublicFunnel({ handle, key });
	const upsellSizes = publicFunnel.upsellProduct?._apparelSizes.map(size => size.size);

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
		// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
		(upsellSizes && upsellSizes.length > 0 && !apparelSize) ||
		converting ||
		submitting ||
		declining;
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
								className='hover:bg-brandKit-block/90 data-[state=on]:bg-brandKit-block data-[state=on]:text-brandKit-block-text'
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
				className='hover:bg-brandKit-block/90 bg-brandKit-block text-brandKit-block-text'
				fullWidth
			>
				{upsellSizes && upsellSizes.length > 0 && !apparelSize ?
					'Select size'
				:	'Use same payment method'}
			</Button>
			<Button
				look='link'
				onClick={handleDeclineUpsell}
				disabled={declineUpsellDisabled}
				loading={declining}
				className='text-brandKit-text'
			>
				No thanks
			</Button>
		</div>
	);
}

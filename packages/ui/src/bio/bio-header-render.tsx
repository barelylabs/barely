import {
	cn,
	getBrandKitButtonRadiusClass,
	getBrandKitOutlineClass,
	getBrandKitShadowClass,
	getComputedStyles,
} from '@barely/utils';

import { Icon } from '../elements/icon';
import { useBioContext } from './contexts/bio-context';
import { useBrandKit } from './contexts/brand-kit-context';

export function BioHeaderRender() {
	const { bio } = useBioContext();
	const brandKit = useBrandKit();
	const computedStyles = getComputedStyles(brandKit);
	const isFullWidthButtons = brandKit.blockStyle === 'full-width';

	return (
		<div className='flex flex-row justify-between'>
			{/* Share Button */}

			<button
				className={cn(
					'fixed right-4 top-4 rounded-full bg-black/10 p-3 backdrop-blur',
					computedStyles.block.radius === '9999px' && 'rounded-full',
					computedStyles.block.radius === '12px' && 'rounded-xl',
					computedStyles.block.radius === '0px' && 'rounded-none',
					!bio.showShareButton && 'hidden',
				)}
				onClick={async () => {
					await navigator.share({
						title: brandKit.workspace?.name ?? bio.handle,
						url: window.location.href,
					});
				}}
			>
				<Icon.share className='h-5 w-5' />
			</button>

			{/* Subscribe Button */}

			<div className={cn('mb-6 flex justify-center', isFullWidthButtons && 'px-6')}>
				<button
					className={cn(
						'px-6 py-3',
						'bg-brandKit-block text-brandKit-block-text',
						getBrandKitButtonRadiusClass(computedStyles.block.radius),
						getBrandKitShadowClass(computedStyles.block.shadow),
						getBrandKitOutlineClass(computedStyles.block.outline),
						!bio.showSubscribeButton && 'hidden',
					)}
				>
					Subscribe
				</button>
			</div>
		</div>
	);
}

import type { ComputedStyles } from '@barely/utils';

interface BioBlocksSkeletonProps {
	computedStyles?: ComputedStyles;
	blockStyle?: string;
}

export function BioBlocksSkeleton({
	computedStyles,
	blockStyle,
}: BioBlocksSkeletonProps = {}) {
	// Determine border radius based on block style
	const borderRadius =
		blockStyle === 'full-width' ? 'rounded-none'
		: computedStyles?.block.radius === '9999px' ? 'rounded-full'
		: computedStyles?.block.radius === '12px' ? 'rounded-xl'
		: 'rounded-xl'; // fallback

	return (
		<div className='flex flex-col gap-3'>
			{/* Skeleton for blocks - matching min-h-[61px] from actual buttons */}
			{[1, 2, 3].map(i => (
				<div
					key={i}
					className={`min-h-[61px] animate-pulse ${borderRadius}`}
					style={{
						backgroundColor:
							computedStyles?.colors.button ?
								`${computedStyles.colors.button}30` // 30 is hex for ~19% opacity
							:	'rgb(229 231 235 / 0.5)', // fallback to gray-200/50
					}}
				/>
			))}
		</div>
	);
}

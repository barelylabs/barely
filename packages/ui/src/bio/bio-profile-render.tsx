import { useMemo } from 'react';
import { cn, getComputedStyles } from '@barely/utils';
import { MapPin } from 'lucide-react';

import { Img } from '../elements/img';
import { useBioContext } from './contexts/bio-context';
import { useBrandKit } from './contexts/brand-kit-context';

export function BioProfileRender() {
	const { bio } = useBioContext();
	const brandKit = useBrandKit();
	const computedStyles = getComputedStyles(brandKit);
	const isFullWidthButtons = brandKit.blockStyle === 'full-width';
	const isHeroStyle = bio.headerStyle === 'minimal.hero';
	const isLeftStyle = bio.headerStyle === 'minimal.left';
	const isCenteredStyle = !isHeroStyle && !isLeftStyle;

	const AvatarImage = useMemo(() => {
		if (!brandKit.avatarS3Key) return null;

		const imageSize =
			isLeftStyle ? 64
			: isCenteredStyle ? 96
			: 400;
		const imageHeight = isHeroStyle ? 192 : imageSize;

		return (
			<Img
				alt={brandKit.workspace?.name ?? bio.handle}
				s3Key={brandKit.avatarS3Key}
				blurDataURL={brandKit.avatarBlurDataUrl ?? undefined}
				className='h-full w-full object-cover'
				width={imageSize}
				height={imageHeight}
				priority
				sizes={
					isLeftStyle ? '64px'
					: isCenteredStyle ?
						'96px'
					:	'(max-width: 640px) 100vw, 400px'
				}
			/>
		);
	}, [
		brandKit.avatarS3Key,
		brandKit.avatarBlurDataUrl,
		brandKit.workspace?.name,
		bio.handle,
		isLeftStyle,
		isCenteredStyle,
		isHeroStyle,
	]);

	if (bio.showHeader === false) return null;

	return (
		<div className={cn(!isFullWidthButtons && '', isFullWidthButtons && 'px-6')}>
			<div
				className={cn(
					'mb-6',
					isLeftStyle && 'flex items-center gap-4',
					isCenteredStyle && 'text-center',
				)}
			>
				{/* Hero background image */}
				{isHeroStyle && !!AvatarImage && (
					<div className='relative -mx-6 -mt-6 mb-4 h-48'>
						<div className='absolute inset-0 bg-gradient-to-t from-transparent to-black/20' />
						{AvatarImage}
					</div>
				)}

				{/* Regular avatar */}
				{!isHeroStyle && !!AvatarImage && (
					<div
						className={cn(
							'overflow-hidden bg-muted',
							bio.imgShape === 'circle' && 'rounded-full',
							bio.imgShape === 'square' && 'rounded-none',
							bio.imgShape === 'rounded' && 'rounded-lg',
							!bio.imgShape && 'rounded-full', // default to circle if not set
							isLeftStyle && 'h-16 w-16',
							isCenteredStyle && 'mx-auto mb-4 h-24 w-24',
						)}
					>
						{AvatarImage}
					</div>
				)}

				{/* Title and subtitle container */}
				<div className={cn(isHeroStyle && 'text-center')}>
					<h1
						className={cn(
							'text-3xl font-bold text-brandKit-text',
							(isHeroStyle || isCenteredStyle) && 'mb-2',
						)}
						style={{
							fontFamily: computedStyles.fonts.headingFont,
						}}
					>
						{brandKit.workspace?.name ?? bio.handle}
					</h1>

					{brandKit.shortBio && (
						<p
							className='text-sm font-normal text-brandKit-text'
							style={{
								fontFamily: computedStyles.fonts.bodyFont,
							}}
						>
							{brandKit.shortBio}
						</p>
					)}
					{bio.showLocation && brandKit.location && (
						<div
							className={cn(
								'mt-2 flex items-center gap-1',
								(isHeroStyle || isCenteredStyle) && 'justify-center',
								isLeftStyle && 'justify-start',
							)}
						>
							<MapPin className='h-3 w-3 text-brandKit-text opacity-60' />
							<p
								className='text-xs font-normal text-brandKit-text opacity-60'
								style={{
									fontFamily: computedStyles.fonts.bodyFont,
								}}
							>
								{brandKit.location}
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

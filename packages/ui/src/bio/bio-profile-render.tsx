import { useMemo } from 'react';
import { cn, getComputedStyles } from '@barely/utils';

import { Img } from '../elements/img';
import { useBio } from './contexts/bio-context';
import { useBrandKit } from './contexts/brand-kit-context';

export function BioProfileRender() {
	const { bio } = useBio();
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
				alt={bio.handle}
				s3Key={brandKit.avatarS3Key}
				blurDataURL={brandKit.avatarBlurDataUrl ?? undefined}
				className='h-full w-full object-cover'
				width={imageSize}
				height={imageHeight}
			/>
		);
	}, [
		brandKit.avatarS3Key,
		brandKit.avatarBlurDataUrl,
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
							'overflow-hidden rounded-full bg-muted',
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
						className={cn('text-3xl', (isHeroStyle || isCenteredStyle) && 'mb-2')}
						style={{
							color: computedStyles.colors.text,
							fontFamily: computedStyles.fonts.headingFont,
							fontWeight: 700,
						}}
					>
						{bio.handle}
					</h1>

					{brandKit.shortBio && (
						<p
							className='text-sm'
							style={{ color: computedStyles.colors.text, fontWeight: 400 }}
						>
							{brandKit.shortBio}
						</p>
					)}
				</div>
			</div>
		</div>
	);
}

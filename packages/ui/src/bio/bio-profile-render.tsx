'use client';

import type { ComputedStyles } from '@barely/lib/functions/bio-themes.fns';
import type { AppRouterOutputs } from '@barely/lib/trpc/app.route';
import { useMemo } from 'react';
import { cn } from '@barely/utils';

import { Img } from '../elements/img';

interface BioProfileRenderProps {
	bio: AppRouterOutputs['bio']['byKey'];
	computedStyles: ComputedStyles;
	headerStyle: string;
	headingFont: string;
}

export function BioProfileRender({
	bio,
	headerStyle,
	computedStyles,
	headingFont,
}: BioProfileRenderProps) {
	const avatarImage = bio.avatarImage;
	const hasAvatar = !!avatarImage?.s3Key;
	const isHeroStyle = headerStyle === 'minimal-hero';
	const isLeftStyle = headerStyle === 'minimal-left';
	const isCenteredStyle = !isHeroStyle && !isLeftStyle;

	// Memoized avatar image component
	const AvatarImage = useMemo(() => {
		if (!avatarImage?.s3Key) return null;

		const imageSize =
			isLeftStyle ? 64
			: isCenteredStyle ? 96
			: 400;
		const imageHeight = isHeroStyle ? 192 : imageSize;

		return (
			<Img
				s3Key={avatarImage.s3Key}
				alt={bio.workspace.name}
				placeholder={avatarImage.blurDataUrl ? 'blur' : undefined}
				blurDataURL={avatarImage.blurDataUrl ?? ''}
				className='h-full w-full object-cover'
				width={imageSize}
				height={imageHeight}
			/>
		);
	}, [
		avatarImage?.s3Key,
		avatarImage?.blurDataUrl,
		bio.workspace.name,
		isLeftStyle,
		isCenteredStyle,
		isHeroStyle,
	]);

	return (
		<div
			className={cn(
				'mb-6',
				isLeftStyle && 'flex items-center gap-4',
				isCenteredStyle && 'text-center',
			)}
		>
			{/* Hero background image */}
			{isHeroStyle && hasAvatar && (
				<div className='relative -mx-6 -mt-6 mb-4 h-48'>
					<div className='absolute inset-0 bg-gradient-to-t from-transparent to-black/20' />
					{AvatarImage}
				</div>
			)}

			{/* Regular avatar */}
			{!isHeroStyle && hasAvatar && (
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
						fontFamily: headingFont,
						fontWeight: 700,
					}}
				>
					{bio.workspace.name}
				</h1>

				{bio.brandKit?.shortBio && (
					<p
						className='text-sm'
						style={{ color: computedStyles.colors.text, fontWeight: 400 }}
					>
						{bio.brandKit.shortBio}
					</p>
				)}
			</div>
		</div>
	);
}

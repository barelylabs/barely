'use client';

import type { AppRouterOutputs } from '@barely/lib/trpc/app.route';
import React from 'react';
import {
	cn,
	getBrandKitButtonRadiusClass,
	getBrandKitOutlineClass,
	getComputedStyles,
	getTrackingEnrichedHref,
} from '@barely/utils';

import { Button } from '../../elements/button';
import { Img } from '../../elements/img';
import { Text } from '../../elements/typography';
import { useBioContext } from '../contexts/bio-context';
import { useBrandKit } from '../contexts/brand-kit-context';

interface LinksBlockProps {
	block: AppRouterOutputs['bio']['blocksByHandleAndKey'][number];
	blockIndex: number;
}

export function LinksBlock({ block, blockIndex }: LinksBlockProps) {
	const { bio, onLinkClick, isPreview, tracking } = useBioContext();
	const brandKit = useBrandKit();
	const computedStyles = getComputedStyles(brandKit);
	const isFullWidthButtons = brandKit.blockStyle === 'full-width';
	const showTitle = block.title && block.title.trim() !== '';
	const showSubtitle = block.subtitle && block.subtitle.trim() !== '';
	return (
		<div className='mx-auto max-w-xl space-y-3'>
			{/* Render block title and subtitle if they exist */}
			{(showTitle ?? showSubtitle) && (
				<div
					className={cn(
						'space-y-1 text-center',
						!isFullWidthButtons && '',
						isFullWidthButtons && 'px-6',
					)}
				>
					{showTitle && (
						<Text
							variant='md/semibold'
							className='text-brandKit-text'
							// style={{
							// 	fontFamily: computedStyles.fonts.headingFont,
							// }}
						>
							{block.title}
						</Text>
					)}
					{showSubtitle && (
						<Text
							variant='xs/normal'
							className='text-brandKit-text opacity-80'
							// style={{
							// 	fontFamily: computedStyles.fonts.bodyFont,
							// }}
						>
							{block.subtitle}
						</Text>
					)}
				</div>
			)}

			{/* Render links */}
			{block.links.map((link, linkIndex) => {
				// Skip disabled links
				if (link.enabled === false) return null;

				// Apply tracking parameters to the link href with journey context
				const originalHref = link.url ?? '#';
				const linkHref =
					isPreview ? `/${bio.handle}/bios/links?bioKey=${bio.key}&blockId=${block.id}`
					: tracking && originalHref !== '#' ?
						getTrackingEnrichedHref({
							href: originalHref,
							tracking,
							currentApp: tracking.currentApp ?? 'bio',
							currentHandle: tracking.currentHandle ?? bio.handle,
							currentKey: tracking.currentKey ?? bio.key,
							currentAssetId: tracking.currentAssetId ?? bio.id,
						})
					:	originalHref;
				const linkTarget = isPreview ? '_self' : '_blank';

				// Map link.animate to our custom looping animations
				const animationClass = (() => {
					switch (link.animate) {
						case 'bounce':
							return 'animate-bio-bounce';
						case 'jello':
							return 'animate-bio-jello';
						case 'wobble':
							return 'animate-bio-wiggle';
						case 'pulse':
							return 'animate-bio-pulse';
						case 'shake':
							return 'animate-bio-shake';
						case 'tada':
							return 'animate-bio-tada';
						default:
							return '';
					}
				})();

				return (
					<Button
						key={link.id}
						href={linkHref}
						target={linkTarget}
						variant='button'
						look='primary'
						fullWidth={true}
						className={cn(
							'h-fit min-h-[61px] text-sm leading-none',
							'hover:bg-brandKit-block/80 bg-brandKit-block text-brandKit-block-text',
							getBrandKitOutlineClass(computedStyles.block.outline),
							isFullWidthButtons ? 'px-4 py-4' : 'px-4 py-3',
							isFullWidthButtons ? 'rounded-none' : (
								getBrandKitButtonRadiusClass(computedStyles.block.radius)
							),
							animationClass, // Add the animation class
						)}
						style={{
							fontFamily: computedStyles.fonts.bodyFont,
							boxShadow: computedStyles.block.shadow,
						}}
						onClick={
							onLinkClick && !isPreview ?
								() => {
									void onLinkClick(link, {
										blockId: block.id,
										blockType: 'links',
										blockIndex,
										linkIndex,
									});
								}
							:	undefined
						}
					>
						<div className='flex w-full items-center gap-3'>
							{/* Image on the left if present */}
							{link.image?.s3Key && (
								<div
									className={cn(
										'h-[45px] w-[45px] flex-shrink-0 overflow-hidden',
										computedStyles.block.radius === '9999px' ? 'rounded-full'
										: computedStyles.block.radius === '12px' ? 'rounded-lg'
										: 'rounded-none',
									)}
								>
									<Img
										s3Key={link.image.s3Key}
										blurDataURL={link.image.blurDataUrl ?? undefined}
										alt={link.text}
										width={45}
										height={45}
										className='h-full w-full object-cover'
									/>
								</div>
							)}
							{/* Text content */}
							<div className='flex-1 text-center'>
								<div className='whitespace-normal break-words'>{link.text}</div>
								{link.subtitle && (
									<div className='mt-1 whitespace-normal break-words text-xs opacity-80'>
										{link.subtitle}
									</div>
								)}
							</div>
							{/* Spacer to balance when image is present */}
							{link.image?.s3Key && <div className='w-[45px]' />}
						</div>
					</Button>
				);
			})}
		</div>
	);
}

'use client';

// import type { PublicBioBlock } from '@barely/lib/functions/bio.fns';
import type { AppRouterOutputs } from '@barely/lib/trpc/app.route';
import React from 'react';
import {
	cn,
	getBrandKitOutlineClass,
	getBrandKitRadiusClass,
	getComputedStyles,
} from '@barely/utils';

import { Button } from '../elements/button';
import { Img } from '../elements/img';
import { Text } from '../elements/typography';
import { useBioContext } from './contexts/bio-context';
import { useBrandKit } from './contexts/brand-kit-context';

interface BioBlocksRenderProps {
	blocks: AppRouterOutputs['bio']['blocksByHandleAndKey'];
}

export function BioBlocksRender({ blocks }: BioBlocksRenderProps) {
	const { bio, onLinkClick, isPreview } = useBioContext();
	const brandKit = useBrandKit();

	const computedStyles = getComputedStyles(brandKit);
	const isFullWidthButtons = brandKit.blockStyle === 'full-width';

	return (
		<div
			className={cn(
				'flex flex-col gap-3',
				!isFullWidthButtons && '',
				isFullWidthButtons && '', // No horizontal padding for full-width buttons
			)}
		>
			{blocks.map((block, blockIndex) => {
				// Only render enabled blocks

				if (!block.enabled) return null;

				// For MVP, we only support links blocks
				if (block.type !== 'links') return null;

				return (
					<div key={block.id} className='space-y-3'>
						{/* Render block title and subtitle if they exist */}
						{(block.title ?? block.subtitle) && (
							<div
								className={cn(
									'space-y-1 text-center',
									!isFullWidthButtons && '',
									isFullWidthButtons && 'px-6',
								)}
							>
								{block.title && (
									<Text
										variant='md/semibold'
										className='text-brandKit-text'
										style={{
											fontFamily: computedStyles.fonts.headingFont,
										}}
									>
										{block.title}
									</Text>
								)}
								{block.subtitle && (
									<Text
										variant='xs/normal'
										className='text-brandKit-text opacity-80'
										style={{
											fontFamily: computedStyles.fonts.bodyFont,
										}}
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

							const linkHref = link.url ?? '#';
							const linkTarget = '_blank';

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
									href={
										isPreview ?
											`/${bio.handle}/bio/home/links?blockId=${block.id}`
										:	linkHref
									}
									target={linkTarget}
									variant='button'
									look='primary'
									fullWidth={true}
									className={cn(
										'h-fit min-h-[61px] text-sm leading-none',
										'bg-brandKit-block text-brandKit-block-text',
										getBrandKitOutlineClass(computedStyles.block.outline),
										isFullWidthButtons ? 'px-4 py-4' : 'px-4 py-3',
										isFullWidthButtons ? 'rounded-none' : (
											getBrandKitRadiusClass(computedStyles.block.radius)
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
													blockType: block.type,
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
										<span className='flex-1 whitespace-normal break-words text-center'>
											{link.text}
										</span>
										{/* Spacer to balance when image is present */}
										{link.image?.s3Key && <div className='w-[45px]' />}
									</div>
								</Button>
							);
						})}
					</div>
				);
			})}

			{/* Add Link Placeholder */}
			{isPreview && (blocks.length === 0 || blocks.every(b => b.links.length === 0)) && (
				<div
					className={cn(
						'border-2 border-dashed px-4 py-3 text-center text-sm',
						'border-brandKit-block text-brandKit-text',
						isFullWidthButtons ? 'rounded-none' : (
							getBrandKitRadiusClass(computedStyles.block.radius)
						),
					)}
					style={{
						fontFamily: computedStyles.fonts.bodyFont,
					}}
				>
					Add your first link
				</div>
			)}
		</div>
	);
}

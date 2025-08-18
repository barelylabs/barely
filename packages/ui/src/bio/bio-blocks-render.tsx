'use client';

// import type { PublicBioBlock } from '@barely/lib/functions/bio.fns';
import type { AppRouterOutputs } from '@barely/lib/trpc/app.route';
import React from 'react';
import { cn, getComputedStyles } from '@barely/utils';

import { Button } from '../elements/button';
import { Text } from '../elements/typography';
import { useBio } from './contexts/bio-context';
import { useBrandKit } from './contexts/brand-kit-context';

interface BioBlocksRenderProps {
	blocks: AppRouterOutputs['bio']['blocksByHandleAndKey'];
}

export function BioBlocksRender({ blocks }: BioBlocksRenderProps) {
	const { bio, onLinkClick, isPreview } = useBio();
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
			{blocks.map(block => {
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
										style={{
											color: computedStyles.colors.text,
											fontFamily: computedStyles.fonts.headingFont,
										}}
									>
										{block.title}
									</Text>
								)}
								{block.subtitle && (
									<Text
										variant='xs/normal'
										style={{
											color: computedStyles.colors.text,
											opacity: 0.8,
										}}
									>
										{block.subtitle}
									</Text>
								)}
							</div>
						)}

						{/* Render links */}
						{block.links.map(link => {
							// Skip disabled links
							if (link.enabled === false) return null;

							const linkHref = link.url ?? '#';
							const linkTarget = '_self';

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
										isFullWidthButtons ? 'px-6 py-4' : 'px-6 py-3',
										isFullWidthButtons ? 'rounded-none'
										: computedStyles.block.radius === '9999px' ? 'rounded-full'
										: computedStyles.block.radius === '12px' ? 'rounded-xl'
										: 'rounded-none',
										animationClass, // Add the animation class
									)}
									style={{
										backgroundColor: computedStyles.colors.button,
										color: computedStyles.colors.buttonText,
										boxShadow: computedStyles.block.shadow,
										border: computedStyles.block.outline,
									}}
									onClick={
										onLinkClick && !isPreview ?
											(e: React.MouseEvent) => {
												e.preventDefault();
												void onLinkClick(link);
											}
										:	undefined
									}
								>
									{link.text}
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
						isFullWidthButtons ? 'rounded-none'
						: computedStyles.block.radius === '9999px' ? 'rounded-full'
						: computedStyles.block.radius === '12px' ? 'rounded-xl'
						: 'rounded-none',
					)}
					style={{
						borderColor: computedStyles.colors.button,
						color: computedStyles.colors.text,
					}}
				>
					Add your first link
				</div>
			)}
		</div>
	);
}

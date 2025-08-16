'use client';

import type { AppRouterOutputs } from '@barely/lib/trpc/app.route';
import type { BioLink } from '@barely/validators';
import React, { useEffect, useRef } from 'react';
import { getComputedStyles } from '@barely/lib/functions/bio-themes.fns';
import { cn } from '@barely/utils';

import { Button } from '../elements/button';
import { Icon } from '../elements/icon';
import { Text } from '../elements/typography';
import { BioEmailCaptureRender } from './bio-email-capture-render';
import { BioProfileRender } from './bio-profile-render';

// Make the component generic so it can accept the proper tRPC output type
// from the consuming application without creating a dependency
export interface BioRenderProps {
	bio: AppRouterOutputs['bio']['byKey'];

	// Callbacks for app-specific behavior
	onLinkClick?: (
		link: BioLink & { blockId: string; lexoRank: string },
	) => void | Promise<void>;
	onEmailCapture?: (
		email: string,
		marketingConsent: boolean,
	) => Promise<{ success: boolean; message: string }>;
	onPageView?: () => void;

	// Feature flags
	isPreview?: boolean;
	enableAnalytics?: boolean;
	showPhoneFrame?: boolean;
	className?: string;
}

export function BioRender({
	bio,
	onLinkClick,
	onEmailCapture,
	onPageView,
	isPreview = false,
	enableAnalytics = true,
	showPhoneFrame = false,
	className,
}: BioRenderProps) {
	// Get data from workspace.brandKit with fallback to props or bio fields
	const { brandKit, headerStyle, showShareButton, showSubscribeButton } = bio;

	const onPageViewTriggered = useRef(false);

	useEffect(() => {
		if (onPageViewTriggered.current) return;

		if (!isPreview && enableAnalytics && onPageView) {
			onPageView();
			onPageViewTriggered.current = true;
		}
	}, [isPreview, enableAnalytics, onPageView]);

	// Get computed styles from the new design system
	const computedStyles = getComputedStyles(bio.brandKit);

	// Determine background color/gradient
	const isGradientBg = computedStyles.colors.background.includes('gradient');
	const backgroundColor = computedStyles.colors.background || '#ffffff';

	// Check if buttons should be full width
	const isFullWidthButtons = brandKit?.blockStyle === 'full-width';

	const content = (
		<div
			className={cn(
				'min-h-[600px]',
				!isFullWidthButtons && 'p-6',
				isFullWidthButtons && 'pt-6', // Only top padding for full-width
				!showPhoneFrame && 'min-h-screen',
			)}
			style={{
				background: isGradientBg ? backgroundColor : undefined,
				backgroundColor: !isGradientBg ? backgroundColor : undefined,
				fontFamily: computedStyles.fonts.bodyFont || "'Inter', sans-serif",
			}}
		>
			{/* Share Button */}
			{showShareButton && !isPreview && (
				<button
					className='fixed right-4 top-4 rounded-full bg-black/10 p-3 backdrop-blur'
					onClick={async () => {
						await navigator.share({
							title: bio.handle,
							url: window.location.href,
						});
					}}
				>
					<Icon.share className='h-5 w-5' />
				</button>
			)}

			{/* Profile Section */}
			{bio.showHeader !== false && (
				<div className={cn(!isFullWidthButtons && '', isFullWidthButtons && 'px-6')}>
					<BioProfileRender
						bio={bio}
						headerStyle={headerStyle}
						computedStyles={computedStyles}
						headingFont={computedStyles.fonts.headingFont}
					/>
				</div>
			)}

			{/* Subscribe Button */}
			{showSubscribeButton && (
				<div className={cn('mb-6 flex justify-center', isFullWidthButtons && 'px-6')}>
					<Button
						variant='button'
						look='primary'
						startIcon='bell'
						className={cn(
							'px-6 py-3',
							computedStyles.block.radius === '9999px' && 'rounded-full',
							computedStyles.block.radius === '12px' && 'rounded-xl',
							computedStyles.block.radius === '0px' && 'rounded-none',
						)}
						style={{
							backgroundColor: computedStyles.colors.button,
							color: computedStyles.colors.buttonText,
							boxShadow: computedStyles.block.shadow,
							border: computedStyles.block.outline,
						}}
					>
						Subscribe
					</Button>
				</div>
			)}

			{/* Email Capture Widget */}
			{bio.emailCaptureEnabled && onEmailCapture && (
				<div className={cn('mb-8', isFullWidthButtons && 'px-6')}>
					<BioEmailCaptureRender
						bioId={bio.id}
						brandKit={bio.brandKit}
						incentiveText={bio.emailCaptureIncentiveText}
						workspaceName={bio.workspace.name}
						onSubmit={onEmailCapture}
						isPreview={isPreview}
					/>
				</div>
			)}

			{/* Blocks */}
			<div
				className={cn(
					'flex flex-col gap-3',
					!isFullWidthButtons && '',
					isFullWidthButtons && '', // No horizontal padding for full-width buttons
				)}
			>
				{bio.blocks.map(block => {
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
										// rel={isPreview ? 'noopener noreferrer' : undefined}
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
				{isPreview &&
					(bio.blocks.length === 0 || bio.blocks.every(b => b.links.length === 0)) && (
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

			{/* Barely Branding */}
			{bio.barelyBranding && (
				<div className={cn('mt-8 text-center', isFullWidthButtons && 'px-6 pb-6')}>
					<a
						href={isPreview ? '#' : 'https://barely.ai'}
						target={isPreview ? undefined : '_blank'}
						rel={isPreview ? undefined : 'noopener noreferrer'}
						className={cn('text-xs opacity-50', isPreview && 'pointer-events-none')}
						style={{ color: computedStyles.colors.text }}
						onClick={isPreview ? (e: React.MouseEvent) => e.preventDefault() : undefined}
					>
						Powered by barely.ai
					</a>
				</div>
			)}
		</div>
	);

	// Wrap in phone frame if requested
	if (showPhoneFrame) {
		return (
			<div
				className={cn(
					'relative mx-auto w-[300px] overflow-hidden rounded-lg border-2 border-black shadow-md',
					className,
				)}
			>
				<div className='max-w-sm'>{content}</div>
			</div>
		);
	}

	return <div className={cn('mx-auto max-w-md', className)}>{content}</div>;
}

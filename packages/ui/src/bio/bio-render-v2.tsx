'use client';

import type { ColorScheme } from '@barely/lib/functions/bio-themes-v2';
import type { BioWithBlocks } from '@barely/validators';
import React from 'react';
import { getComputedStyles } from '@barely/lib/functions/bio-themes-v2';
import { cn } from '@barely/utils';

import { Button } from '../elements/button';
import { Icon } from '../elements/icon';
import { Text } from '../elements/typography';
import { BioButtonRender } from './bio-button-render';
import { BioEmailCaptureRender } from './bio-email-capture-render';
import { BioProfileRenderV2 } from './bio-profile-render-v2';

export interface BioRenderV2Props {
	bio: BioWithBlocks;

	// New design system fields
	themeKey?: string | null;
	headerStyle?: string | null;
	appearancePreset?: string | null;
	colorScheme?: string | null;
	fontPreset?: string | null;
	headingFont?: string | null;
	bodyFont?: string | null;
	blockStyle?: string | null;
	blockShadow?: boolean;
	blockOutline?: boolean;
	showShareButton?: boolean;
	showSubscribeButton?: boolean;

	// Callbacks for app-specific behavior
	onLinkClick?: (
		link: BioWithBlocks['blocks'][0]['links'][0],
		position: number,
		blockId: string,
	) => void | Promise<void>;
	onEmailCapture?: (
		email: string,
		marketingConsent: boolean,
	) => Promise<{ success: boolean; message: string }>;
	onPageView?: () => void;

	// Feature flags
	isPreview?: boolean;
	enableAnalytics?: boolean;
	className?: string;
	showPhoneFrame?: boolean;
}

export function BioRenderV2({
	bio,
	themeKey: themeKeyProp,
	headerStyle: headerStyleProp,
	appearancePreset: appearancePresetProp,
	colorScheme: colorSchemeProp,
	fontPreset: fontPresetProp,
	headingFont: headingFontProp,
	bodyFont: bodyFontProp,
	blockStyle: blockStyleProp,
	blockShadow: blockShadowProp,
	blockOutline: blockOutlineProp,
	showShareButton,
	showSubscribeButton,
	onLinkClick,
	onEmailCapture,
	onPageView,
	isPreview = false,
	enableAnalytics = true,
	className,
	showPhoneFrame = false,
}: BioRenderV2Props) {
	// Get data from workspace.brandKit with fallback to props or bio fields
	const brandKit = bio.workspace?.brandKit;
	const themeKey = themeKeyProp ?? brandKit?.themeKey;
	const headerStyle = headerStyleProp ?? bio.headerStyle;
	const appearancePreset = appearancePresetProp ?? brandKit?.appearancePreset;
	const colorScheme =
		colorSchemeProp ??
		(brandKit?.colorScheme ? JSON.stringify(brandKit.colorScheme) : null);
	const fontPreset = fontPresetProp ?? brandKit?.fontPreset;
	const headingFont = headingFontProp ?? brandKit?.headingFont;
	const bodyFont = bodyFontProp ?? brandKit?.bodyFont;
	const blockStyle = blockStyleProp ?? brandKit?.blockStyle;
	const blockShadow = blockShadowProp ?? bio.blockShadow;
	const blockOutline = blockOutlineProp ?? brandKit?.blockOutline;
	// Record page view on mount
	React.useEffect(() => {
		if (!isPreview && enableAnalytics && onPageView) {
			onPageView();
		}
	}, [isPreview, enableAnalytics, onPageView]);

	// Parse color scheme
	const parsedColorScheme: ColorScheme | null =
		colorScheme ?
			(() => {
				try {
					return JSON.parse(colorScheme) as ColorScheme;
				} catch {
					return null;
				}
			})()
		:	null;

	// Get computed styles from the new design system
	const computedStyles = getComputedStyles({
		colorScheme: parsedColorScheme,
		fontPreset: (fontPreset as any) || 'modern.cal',
		blockStyle: (blockStyle as any) || 'rounded',
		blockShadow: blockShadow ?? false,
		blockOutline: blockOutline ?? false,
	});

	// Determine background color/gradient
	const isGradientBg = computedStyles.colors.background?.includes('gradient');
	const backgroundColor = computedStyles.colors.background || '#ffffff';

	// Check if buttons should be full width
	const isFullWidthButtons = blockStyle === 'full-width';

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
				fontFamily: bodyFont ?? (computedStyles.fonts.bodyFont || "'Inter', sans-serif"),
			}}
		>
			{/* Share Button */}
			{showShareButton && !isPreview && (
				<button
					className='fixed right-4 top-4 rounded-full bg-black/10 p-3 backdrop-blur'
					onClick={() => {
						if (navigator.share) {
							navigator.share({
								title: bio.handle,
								url: window.location.href,
							});
						}
					}}
				>
					<Icon.share className='h-5 w-5' />
				</button>
			)}

			{/* Profile Section */}
			{bio.showHeader !== false && (
				<div className={cn(!isFullWidthButtons && '', isFullWidthButtons && 'px-6')}>
					<BioProfileRenderV2
						bio={bio}
						headerStyle={headerStyle || 'minimal-centered'}
						computedStyles={computedStyles}
						headingFont={
							headingFont || computedStyles.fonts?.headingFont || "'Cal Sans', sans-serif"
						}
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
						incentiveText={bio.emailCaptureIncentiveText}
						workspaceName={bio.workspace?.name ?? bio.handle}
						onSubmit={onEmailCapture}
						isPreview={isPreview}
						// theme='default'
						// themeConfig={{} as any}
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
				{bio.blocks?.map(block => {
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
												fontFamily: headingFont ?? computedStyles.fonts.headingFont,
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
							{block.links.map((link, index) => {
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
													onLinkClick(link, index, block.id);
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
					(!bio.blocks ||
						bio.blocks.length === 0 ||
						bio.blocks.every(b => !b.links || b.links.length === 0)) && (
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

'use client';

import type { AppRouterOutputs } from '@barely/lib/trpc/app.route';
import React from 'react';
import { BIO_BLOCK_ICON_OPTIONS } from '@barely/const';
import {
	cn,
	getAbsoluteUrl,
	getBrandKitBlockRadiusClass,
	getBrandKitButtonRadiusClass,
	getBrandKitOutlineClass,
	getComputedStyles,
	getTrackingEnrichedHref,
} from '@barely/utils';

import { ProductPrice } from '../../components/cart/product-price';
import { Button } from '../../elements/button';
import { Icon } from '../../elements/icon';
import { Img } from '../../elements/img';
import { Text } from '../../elements/typography';
import { useBioContext } from '../contexts/bio-context';
import { useBrandKit } from '../contexts/brand-kit-context';

interface CartBlockProps {
	block: AppRouterOutputs['bio']['blocksByHandleAndKey'][number];
	blockIndex: number;
}

// Animation class mapping (same as bio-links-page)
const getAnimationClass = (animation: string) => {
	const animationMap: Record<string, string> = {
		bounce: 'animate-bio-bounce',
		jello: 'animate-bio-jello',
		wobble: 'animate-bio-wiggle',
		pulse: 'animate-bio-pulse',
		shake: 'animate-bio-shake',
		tada: 'animate-bio-tada',
	};
	return animationMap[animation] ?? '';
};

export function CartBlock({ block, blockIndex }: CartBlockProps) {
	const { bio, isPreview, onTargetCartFunnelClick, tracking } = useBioContext();
	const brandKit = useBrandKit();
	const computedStyles = getComputedStyles(brandKit);

	// Early return if no cart funnel
	if (!block.targetCartFunnel) {
		return null;
	}

	const { targetCartFunnel } = block;
	const baseCheckoutUrl =
		isPreview ?
			`/${bio.handle}/bio/home/blocks?blockId=${block.id}`
		:	getAbsoluteUrl('cart', `/${targetCartFunnel.handle}/${targetCartFunnel.key}`);

	// Apply tracking parameters to checkout URL
	const checkoutUrl =
		!isPreview && tracking ?
			getTrackingEnrichedHref({ href: baseCheckoutUrl, tracking })
		:	baseCheckoutUrl;

	const product = targetCartFunnel.mainProduct;
	const originalPrice = product.price;
	const discount = targetCartFunnel.mainProductDiscount ?? 0;
	const isPayWhatYouWant = targetCartFunnel.mainProductPayWhatYouWant ?? false;

	// Calculate the final price
	const finalPrice =
		isPayWhatYouWant ? 0
		: discount > 0 ? originalPrice - (originalPrice * discount) / 100
		: originalPrice;

	const hasDiscount = discount > 0 && !isPayWhatYouWant;

	// If styleAsButton is true, just render the button
	if (block.styleAsButton) {
		return (
			<Button
				href={checkoutUrl}
				target='_blank'
				variant='button'
				look='primary'
				size='lg'
				fullWidth={true}
				className={cn(
					'bg-brandKit-block text-brandKit-block-text',
					'hover:bg-brandKit-block/90',
					getBrandKitOutlineClass(computedStyles.block.outline),
					getBrandKitButtonRadiusClass(computedStyles.block.radius),
					// Add animation class if specified
					block.ctaAnimation &&
						block.ctaAnimation !== 'none' &&
						getAnimationClass(block.ctaAnimation),
				)}
				style={{
					fontFamily: computedStyles.fonts.bodyFont,
					boxShadow: computedStyles.block.shadow,
				}}
				onClick={async () => {
					if (onTargetCartFunnelClick && block.targetCartFunnel) {
						return await onTargetCartFunnelClick(block.targetCartFunnel, {
							blockId: block.id,
							blockType: 'cart',
							blockIndex,
							linkIndex: 0,
						});
					}
				}}
			>
				<span className='flex items-center justify-center gap-2'>
					{block.ctaIcon &&
						block.ctaIcon !== 'none' &&
						(() => {
							const iconOption = BIO_BLOCK_ICON_OPTIONS.find(
								opt => opt.value === block.ctaIcon,
							);

							const CtaIcon =
								iconOption?.icon ? Icon[iconOption.icon as keyof typeof Icon] : null;

							if (!CtaIcon) return null;
							return iconOption?.icon ? <CtaIcon className='h-4 w-4' /> : null;
						})()}
					{block.ctaText ?? 'Get Instant Access'}
				</span>
			</Button>
		);
	}

	// Otherwise render the full block
	return (
		<div
			className={cn(
				'relative overflow-hidden',
				// Strong container with elevated appearance
				'bg-brandKit-block/5 backdrop-blur-sm',
				'border-brandKit-block/20 border-2',
				getBrandKitBlockRadiusClass(computedStyles.block.radius),
				'p-5',
			)}
			style={{
				boxShadow: `0 4px 20px rgba(0, 0, 0, 0.08), ${computedStyles.block.shadow}`,
			}}
		>
			{/* Discount Badge - positioned absolutely */}
			{hasDiscount && (
				<div className='absolute -right-8 top-4 rotate-12'>
					<div
						className='bg-brandKit-block px-6 py-1 text-center'
						style={{
							fontFamily: computedStyles.fonts.bodyFont,
						}}
					>
						<Text variant='xs/semibold' className='text-brandKit-block-text'>
							SAVE {discount}%
						</Text>
					</div>
				</div>
			)}

			{/* Header Section */}
			{(block.title ?? block.subtitle ?? targetCartFunnel.name) && (
				<div className='mb-4 space-y-1 text-center'>
					{(block.title ?? targetCartFunnel.name) && (
						<Text
							variant='lg/semibold'
							className='text-brandKit-block'
							style={{
								fontFamily: computedStyles.fonts.headingFont,
							}}
						>
							{block.title ?? targetCartFunnel.name}
						</Text>
					)}
					{block.subtitle && (
						<Text
							variant='sm/normal'
							className='text-brandKit-block/80'
							style={{
								fontFamily: computedStyles.fonts.bodyFont,
							}}
						>
							{block.subtitle}
						</Text>
					)}
				</div>
			)}

			{/* Product Section - Cleaner layout without nested container */}
			<div className='space-y-3'>
				{/* Top Row: Image + Name/Price */}
				<div className='flex items-start gap-4'>
					{/* Product Image */}
					{product._images[0]?.file.s3Key && (
						<div
							className={cn(
								'h-24 w-24 flex-shrink-0 overflow-hidden',
								getBrandKitBlockRadiusClass(computedStyles.block.radius),
								'border-brandKit-text/10 border',
							)}
						>
							<Img
								s3Key={product._images[0].file.s3Key}
								blurDataURL={product._images[0].file.blurDataUrl ?? undefined}
								alt={product.name}
								width={96}
								height={96}
								className='h-full w-full object-cover'
							/>
						</div>
					)}

					{/* Product Name and Price */}
					<div className='flex-1'>
						<Text
							variant='md/semibold'
							className='mb-1 text-brandKit-text'
							style={
								{
									// fontFamily: computedStyles.fonts.headingFont,
								}
							}
						>
							{product.name}
						</Text>

						{/* Price Display */}
						<div
						//  style={{ fontFamily: computedStyles.fonts.headingFont }}
						>
							<ProductPrice
								price={finalPrice}
								normalPrice={originalPrice}
								variant='lg/semibold'
								className='text-brandKit-block'
								currency={targetCartFunnel.workspace.currency}
							/>
						</div>
					</div>
				</div>

				{/* Product Description - Below the top row */}
				{product.description && (
					<Text
						variant='xs/normal'
						className='text-brandKit-text/70'
						style={{
							fontFamily: computedStyles.fonts.bodyFont,
						}}
					>
						{product.description}
					</Text>
				)}
			</div>

			{/* CTA Button with optional animation and icon */}
			<Button
				href={checkoutUrl}
				target='_blank'
				variant='button'
				look='primary'
				size='lg'
				fullWidth={true}
				className={cn(
					'mt-5',
					'bg-brandKit-block text-brandKit-block-text',
					'hover:bg-brandKit-block/90',
					getBrandKitOutlineClass(computedStyles.block.outline),
					getBrandKitButtonRadiusClass(computedStyles.block.radius),
					// Add animation class if specified
					block.ctaAnimation &&
						block.ctaAnimation !== 'none' &&
						getAnimationClass(block.ctaAnimation),
				)}
				style={{
					fontFamily: computedStyles.fonts.bodyFont,
					boxShadow: computedStyles.block.shadow,
				}}
				onClick={async () => {
					if (onTargetCartFunnelClick && block.targetCartFunnel) {
						return await onTargetCartFunnelClick(block.targetCartFunnel, {
							blockId: block.id,
							blockType: 'cart',
							blockIndex,
							linkIndex: 0,
						});
					}
				}}
			>
				<span className='flex items-center justify-center gap-2'>
					{block.ctaIcon &&
						block.ctaIcon !== 'none' &&
						(() => {
							const iconOption = BIO_BLOCK_ICON_OPTIONS.find(
								opt => opt.value === block.ctaIcon,
							);

							const CtaIcon =
								iconOption?.icon ? Icon[iconOption.icon as keyof typeof Icon] : null;

							if (!CtaIcon) return null;
							return iconOption?.icon ? <CtaIcon className='h-4 w-4' /> : null;
						})()}
					{block.ctaText ?? 'Get Instant Access'}
				</span>
			</Button>

			{/* Learn More Link */}
			{(block.learnMoreUrl ?? block.learnMoreBioId) &&
				(() => {
					const baseLearnMoreUrl =
						block.learnMoreBioId && block.learnMoreBio ?
							getAbsoluteUrl(
								'bio',
								`/${block.learnMoreBio.handle}/${block.learnMoreBio.key}`,
							)
						:	(block.learnMoreUrl ?? '#');

					// Apply tracking parameters to learn more link
					const learnMoreUrl =
						tracking && baseLearnMoreUrl !== '#' ?
							getTrackingEnrichedHref({ href: baseLearnMoreUrl, tracking })
						:	baseLearnMoreUrl;

					return (
						<div className='mt-3 text-center'>
							<a
								href={learnMoreUrl}
								target='_blank'
								rel='noopener noreferrer'
								className='text-brandKit-text/70 hover:text-brandKit-text/90 text-sm underline'
								style={{
									fontFamily: computedStyles.fonts.bodyFont,
								}}
							>
								{block.learnMoreText ?? 'Learn more'}
							</a>
						</div>
					);
				})()}
		</div>
	);
}

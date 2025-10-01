'use client';

import type { AppRouterOutputs } from '@barely/lib/trpc/app.route';
import React, { useState } from 'react';
import { cn, getBrandKitRadiusClass, getComputedStyles } from '@barely/utils';

import { Img } from '../../elements/img';
import { Text } from '../../elements/typography';
import { useBrandKit } from '../contexts/brand-kit-context';

interface ImageBlockProps {
	block: AppRouterOutputs['bio']['blocksByHandleAndKey'][number];
	blockIndex: number;
}

export function ImageBlock({ block }: ImageBlockProps) {
	const brandKit = useBrandKit();
	const computedStyles = getComputedStyles(brandKit);
	const [isLightboxOpen, setIsLightboxOpen] = useState(false);

	// Early return if no image
	if (!block.imageFile?.s3Key) {
		return null;
	}

	const handleImageClick = () => {
		setIsLightboxOpen(true);
	};

	const handleLightboxClose = () => {
		setIsLightboxOpen(false);
	};

	return (
		<>
			<div className='mx-auto max-w-xl space-y-4'>
				{/* Block title and subtitle */}
				{(block.title ?? block.subtitle) && (
					<div className='space-y-1 text-center'>
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

				{/* Image with optional click to expand */}
				<div
					className={cn(
						'group relative cursor-pointer overflow-hidden',
						getBrandKitRadiusClass(computedStyles.block.radius),
					)}
					onClick={handleImageClick}
				>
					<Img
						s3Key={block.imageFile.s3Key}
						blurDataURL={block.imageFile.blurDataUrl ?? undefined}
						alt={block.imageAltText ?? block.imageCaption ?? 'Image'}
						width={800}
						height={600}
						className={cn(
							'h-auto w-full object-cover',
							'transition-transform duration-300 group-hover:scale-105',
						)}
						sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
						priority={false}
						loading='lazy'
					/>

					{/* Hover overlay */}
					<div className='pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10' />
				</div>

				{/* Caption */}
				{block.imageCaption && (
					<Text
						variant='xs/normal'
						className='text-center italic text-brandKit-text opacity-70'
						style={{
							fontFamily: computedStyles.fonts.bodyFont,
						}}
					>
						{block.imageCaption}
					</Text>
				)}
			</div>

			{/* Lightbox modal */}
			{isLightboxOpen && (
				<div
					className='fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black/90 p-4 duration-200 animate-in fade-in'
					onClick={handleLightboxClose}
				>
					<div className='relative flex h-full max-h-[90vh] w-full max-w-7xl items-center justify-center'>
						<Img
							s3Key={block.imageFile.s3Key}
							blurDataURL={block.imageFile.blurDataUrl ?? undefined}
							alt={block.imageAltText ?? block.imageCaption ?? 'Image'}
							width={1920}
							height={1080}
							className='max-h-full max-w-full object-contain'
							sizes='100vw'
							priority={true}
						/>

						{/* Close button */}
						<button
							className='absolute right-4 top-4 text-white transition-colors hover:text-gray-300'
							onClick={handleLightboxClose}
							aria-label='Close lightbox'
						>
							<svg
								className='h-8 w-8'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M6 18L18 6M6 6l12 12'
								/>
							</svg>
						</button>

						{/* Caption in lightbox */}
						{block.imageCaption && (
							<div className='absolute bottom-4 left-4 right-4 text-center'>
								<Text
									variant='sm/normal'
									className='text-white'
									style={{
										fontFamily: computedStyles.fonts.bodyFont,
									}}
								>
									{block.imageCaption}
								</Text>
							</div>
						)}
					</div>
				</div>
			)}
		</>
	);
}

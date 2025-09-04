import type { BioBlockType } from '@barely/const';
import type { AppRouterOutputs } from '@barely/lib/trpc/app.route';
import type { ComputedStyles } from '@barely/utils';
import type { BioTrackingData } from '@barely/validators/schemas';
import type { ReactNode } from 'react';
import React from 'react';
import {
	cn,
	getAbsoluteUrl,
	getBrandKitOutlineClass,
	getBrandKitRadiusClass,
	getTrackingEnrichedHref,
} from '@barely/utils';

import { Button } from '../../elements/button';
import { Img } from '../../elements/img';
import { Text } from '../../elements/typography';

interface TwoPanelBlockSharedProps {
	block: AppRouterOutputs['bio']['blocksByHandleAndKey'][number];
	blockIndex: number;
	markdownContent?: ReactNode;
	computedStyles: ComputedStyles;
	bio: {
		handle: string;
	};
	isPreview?: boolean;
	tracking?: BioTrackingData;
	onTargetLinkClick?:
		| ((
				targetLink: NonNullable<
					AppRouterOutputs['bio']['blocksByHandleAndKey'][number]['targetLink']
				>,
				meta: {
					blockId: string;
					blockType: BioBlockType;
					blockIndex: number;
					linkIndex: number;
					targetLinkId: string;
				},
		  ) => void | Promise<void>)
		| null;
	onTargetCartFunnelClick?:
		| ((
				targetCartFunnel: NonNullable<
					AppRouterOutputs['bio']['blocksByHandleAndKey'][number]['targetCartFunnel']
				>,
				meta: {
					blockId: string;
					blockType: BioBlockType;
					blockIndex: number;
					linkIndex: number;
					targetCartFunnelId: string;
				},
		  ) => void | Promise<void>)
		| null;
	onTargetFmClick?:
		| ((
				targetFm: NonNullable<
					AppRouterOutputs['bio']['blocksByHandleAndKey'][number]['targetFm']
				>,
				meta: {
					blockId: string;
					blockType: BioBlockType;
					blockIndex: number;
					linkIndex: number;
					targetFmId: string;
				},
		  ) => void | Promise<void>)
		| null;
	onTargetBioClick?:
		| ((
				targetBio: NonNullable<
					AppRouterOutputs['bio']['blocksByHandleAndKey'][number]['targetBio']
				>,
				meta: {
					blockId: string;
					blockType: BioBlockType;
					blockIndex: number;
					linkIndex: number;
					targetBioId: string;
				},
		  ) => void | Promise<void>)
		| null;
	onTargetUrlClick?:
		| ((
				targetUrl: string,
				meta: {
					blockId: string;
					blockType: BioBlockType;
					blockIndex: number;
					linkIndex: number;
					targetUrl: string;
				},
		  ) => void | Promise<void>)
		| null;
}

export function TwoPanelBlockShared({
	block,
	blockIndex,
	markdownContent,
	computedStyles,
	bio,
	isPreview,
	tracking,
	onTargetLinkClick,
	onTargetCartFunnelClick,
	onTargetFmClick,
	onTargetBioClick,
	onTargetUrlClick,
}: TwoPanelBlockSharedProps) {
	// Determine CTA href based on target type
	const getCtaHref = () => {
		if (isPreview) {
			return `/${bio.handle}/bio/home/blocks?blockId=${block.id}`;
		}

		let baseHref = '#';

		if (block.targetUrl) {
			baseHref = block.targetUrl;
		} else if (block.targetBio) {
			baseHref = getAbsoluteUrl(
				'bio',
				`/${block.targetBio.handle}/bio/${block.targetBio.key}`,
			);
		} else if (block.targetFm) {
			// FM routes not implemented yet
			baseHref = getAbsoluteUrl('fm', `/${block.targetFm.handle}/${block.targetFm.key}`);
		} else if (block.targetCartFunnel) {
			// Cart checkout URL logic would go here
			baseHref = getAbsoluteUrl('cart', `/${block.targetCartFunnel.key}`);
		} else if (block.targetLink) {
			// Short link redirect
			baseHref = block.targetLink.url;
		}

		// Apply tracking parameters if available
		if (tracking && baseHref !== '#') {
			return getTrackingEnrichedHref({ href: baseHref, tracking });
		}

		return baseHref;
	};

	const imageDesktopSide = block.imageDesktopSide ?? 'left';
	const imageMobileSide = block.imageMobileSide ?? 'top';

	return (
		<div
			className={cn(
				'flex w-full flex-col gap-4',

				!isPreview && 'md:grid md:grid-cols-2 md:items-center md:gap-6',
				imageDesktopSide === 'right' && 'md:grid-flow-dense',
				imageMobileSide === 'bottom' && 'flex-col-reverse',
			)}
		>
			{/* Image Panel */}
			<div
				className={cn(
					'relative overflow-hidden',
					getBrandKitRadiusClass(computedStyles.block.radius),
					imageDesktopSide === 'right' && 'md:col-start-2',
				)}
			>
				{block.imageFile && (
					<Img
						s3Key={block.imageFile.s3Key}
						blurDataURL={block.imageFile.blurDataUrl ?? undefined}
						alt={block.imageAltText ?? block.imageCaption ?? 'Image'}
						width={600}
						height={600}
						className='aspect-square h-full w-full object-cover'
						sizes='(max-width: 768px) 100vw, 50vw'
						priority={false}
						loading='lazy'
					/>
				)}
			</div>

			{/* Content Panel */}
			<div
				className={cn(
					'flex flex-col space-y-3',
					!isPreview && 'px-4 md:justify-center md:space-y-4 md:p-6',
					imageDesktopSide === 'right' && 'md:col-start-1',
				)}
			>
				{/* Title */}
				{block.title && (
					<Text
						variant='md/semibold'
						className='text-center text-brandKit-text md:text-left md:text-lg md:font-semibold'
						style={{
							fontFamily: computedStyles.fonts.headingFont,
						}}
					>
						{block.title}
					</Text>
				)}

				{/* Markdown content - passed in from client or server component */}
				{markdownContent && (
					<div className='prose prose-sm max-w-none text-center text-brandKit-text md:text-left'>
						{markdownContent}
					</div>
				)}

				{/* CTA Button */}
				{block.ctaText && (
					<div className='pt-2'>
						<Button
							href={getCtaHref()}
							target={block.targetUrl ? '_blank' : '_self'}
							variant='button'
							look='primary'
							size='md'
							fullWidth={true}
							className={cn(
								'hover:bg-brandKit-block/80 bg-brandKit-block text-brandKit-block-text md:w-auto',
								getBrandKitOutlineClass(computedStyles.block.outline),
								getBrandKitRadiusClass(computedStyles.block.radius),
							)}
							style={{
								fontFamily: computedStyles.fonts.bodyFont,
								boxShadow: computedStyles.block.shadow,
							}}
							onClick={async () => {
								if (block.targetLink && !!onTargetLinkClick) {
									return await onTargetLinkClick(block.targetLink, {
										blockId: block.id,
										blockType: 'twoPanel',
										blockIndex,
										linkIndex: 0,
										targetLinkId: block.targetLink.id,
									});
								}

								if (block.targetCartFunnel && !!onTargetCartFunnelClick) {
									return await onTargetCartFunnelClick(block.targetCartFunnel, {
										blockId: block.id,
										blockType: 'twoPanel',
										blockIndex,
										linkIndex: 0,
										targetCartFunnelId: block.targetCartFunnel.id,
									});
								}

								if (block.targetFm && !!onTargetFmClick) {
									return await onTargetFmClick(block.targetFm, {
										blockId: block.id,
										blockType: 'twoPanel',
										blockIndex,
										linkIndex: 0,
										targetFmId: block.targetFm.id,
									});
								}

								if (block.targetBio && !!onTargetBioClick) {
									return await onTargetBioClick(block.targetBio, {
										blockId: block.id,
										blockType: 'twoPanel',
										blockIndex,
										linkIndex: 0,
										targetBioId: block.targetBio.id,
									});
								}

								if (block.targetUrl && !!onTargetUrlClick) {
									return await onTargetUrlClick(block.targetUrl, {
										blockId: block.id,
										blockType: 'twoPanel',
										blockIndex,
										linkIndex: 0,
										targetUrl: block.targetUrl,
									});
								}
							}}
						>
							{block.ctaText}
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}

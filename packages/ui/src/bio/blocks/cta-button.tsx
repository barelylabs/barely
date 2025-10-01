'use client';

import type { BioBlockType } from '@barely/const';
import type { AppRouterOutputs } from '@barely/lib/trpc/app.route';
import React from 'react';
import {
	cn,
	getAbsoluteUrl,
	getBrandKitButtonRadiusClass,
	getBrandKitOutlineClass,
	getComputedStyles,
	getTrackingEnrichedHref,
} from '@barely/utils';

import { Button } from '../../elements/button';
import { useBioContext } from '../contexts/bio-context';
import { useBrandKit } from '../contexts/brand-kit-context';

interface CtaButtonProps {
	block: AppRouterOutputs['bio']['blocksByHandleAndKey'][number];
	blockIndex: number;
	blockType: BioBlockType;
	className?: string;
}

export function CtaButton({ block, blockIndex, blockType, className }: CtaButtonProps) {
	const {
		bio,
		isPreview,
		tracking,
		onTargetLinkClick,
		onTargetCartFunnelClick,
		onTargetFmClick,
		onTargetBioClick,
		onTargetUrlClick,
	} = useBioContext();
	const brandKit = useBrandKit();
	const computedStyles = getComputedStyles(brandKit);

	// Don't render if no CTA text
	if (!block.ctaText) return null;

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
			// Cart checkout URL logic
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

	return (
		<Button
			href={getCtaHref()}
			target={block.targetUrl ? '_blank' : '_self'}
			variant='button'
			look='primary'
			size='lg'
			fullWidth={true}
			className={cn(
				'hover:bg-brandKit-block/80 bg-brandKit-block text-brandKit-block-text',
				getBrandKitOutlineClass(computedStyles.block.outline),
				getBrandKitButtonRadiusClass(computedStyles.block.radius),
				className,
			)}
			style={{
				fontFamily: computedStyles.fonts.bodyFont,
				boxShadow: computedStyles.block.shadow,
			}}
			onClick={async () => {
				if (block.targetLink && !!onTargetLinkClick) {
					return await onTargetLinkClick(block.targetLink, {
						blockId: block.id,
						blockType,
						blockIndex,
						linkIndex: 0,
						targetLinkId: block.targetLink.id,
					});
				}

				if (block.targetCartFunnel && !!onTargetCartFunnelClick) {
					return await onTargetCartFunnelClick(block.targetCartFunnel, {
						blockId: block.id,
						blockType,
						blockIndex,
						linkIndex: 0,
						targetCartFunnelId: block.targetCartFunnel.id,
					});
				}

				if (block.targetFm && !!onTargetFmClick) {
					return await onTargetFmClick(block.targetFm, {
						blockId: block.id,
						blockType,
						blockIndex,
						linkIndex: 0,
						targetFmId: block.targetFm.id,
					});
				}

				if (block.targetBio && !!onTargetBioClick) {
					return await onTargetBioClick(block.targetBio, {
						blockId: block.id,
						blockType,
						blockIndex,
						linkIndex: 0,
						targetBioId: block.targetBio.id,
					});
				}

				if (block.targetUrl && !!onTargetUrlClick) {
					return await onTargetUrlClick(block.targetUrl, {
						blockId: block.id,
						blockType,
						blockIndex,
						linkIndex: 0,
						targetUrl: block.targetUrl,
					});
				}
			}}
		>
			{block.ctaText}
		</Button>
	);
}

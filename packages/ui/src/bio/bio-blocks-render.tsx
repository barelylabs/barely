'use client';

// import type { PublicBioBlock } from '@barely/lib/functions/bio.fns';
import type { AppRouterOutputs } from '@barely/lib/trpc/app.route';
import React, { useEffect } from 'react';
import { cn, getBrandKitButtonRadiusClass, getComputedStyles } from '@barely/utils';

import { CartBlock } from './blocks/cart-block';
import { ContactFormBlock } from './blocks/contact-form-block';
import { ImageBlock } from './blocks/image-block';
import { LinksBlock } from './blocks/links-block';
import { MarkdownBlock } from './blocks/markdown-block';
import { TwoPanelBlock } from './blocks/two-panel-block';
import { useBioContext } from './contexts/bio-context';
import { useBrandKit } from './contexts/brand-kit-context';

interface BioBlocksRenderProps {
	blocks: AppRouterOutputs['bio']['blocksByHandleAndKey'];
	targetBlockId?: string;
}

export function BioBlocksRender({ blocks, targetBlockId }: BioBlocksRenderProps) {
	const { isPreview } = useBioContext();
	const brandKit = useBrandKit();

	const computedStyles = getComputedStyles(brandKit);
	const isFullWidthButtons = brandKit.blockStyle === 'full-width';

	// Auto-scroll to target block when in preview mode
	useEffect(() => {
		// Only run in preview mode and when targetBlockId is provided
		if (!isPreview || !targetBlockId) return;

		// Small delay to ensure DOM is ready
		const timer = setTimeout(() => {
			const element = document.querySelector(`[data-block-id="${targetBlockId}"]`);
			if (element) {
				element.scrollIntoView({ behavior: 'smooth', block: 'center' });

				// Add highlight animation
				element.classList.add('animate-highlight');
				// Remove animation class after it completes
				setTimeout(() => {
					element.classList.remove('animate-highlight');
				}, 2000);
			}
		}, 100);

		return () => clearTimeout(timer);
	}, [targetBlockId, isPreview]);

	return (
		<div
			className={cn(
				'flex flex-col gap-10 md:gap-14 lg:gap-16',
				// brandKit.blockShadow && 'gap-4',
				!isFullWidthButtons && '',
				isFullWidthButtons && '', // No horizontal padding for full-width buttons
			)}
		>
			{blocks.map((block, blockIndex) => {
				// Only render enabled blocks
				if (!block.enabled) return null;

				// Wrap each block in a div with data-block-id for targeting
				const blockContent = (() => {
					switch (block.type) {
						case 'links':
							return <LinksBlock key={block.id} block={block} blockIndex={blockIndex} />;

						case 'markdown':
							return (
								<MarkdownBlock key={block.id} block={block} blockIndex={blockIndex} />
							);

						case 'image':
							return <ImageBlock key={block.id} block={block} blockIndex={blockIndex} />;

						case 'twoPanel':
							return (
								<TwoPanelBlock key={block.id} block={block} blockIndex={blockIndex} />
							);

						case 'cart':
							return <CartBlock key={block.id} block={block} blockIndex={blockIndex} />;

						case 'contactForm':
							return (
								<ContactFormBlock key={block.id} block={block} blockIndex={blockIndex} />
							);

						default:
							// Unknown block type, skip
							return null;
					}
				})();

				if (!blockContent) return null;

				return (
					<div key={block.id} data-block-id={block.id}>
						{blockContent}
					</div>
				);
			})}

			{/* Add Link Placeholder - only show if no blocks, or only empty link blocks */}
			{isPreview &&
				(blocks.length === 0 ||
					(blocks.every(b => b.type === 'links') &&
						blocks.every(b => b.links.length === 0))) && (
					<div
						className={cn(
							'border-2 border-dashed px-4 py-3 text-center text-sm',
							'border-brandKit-block text-brandKit-text',
							isFullWidthButtons ? 'rounded-none' : (
								getBrandKitButtonRadiusClass(computedStyles.block.radius)
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

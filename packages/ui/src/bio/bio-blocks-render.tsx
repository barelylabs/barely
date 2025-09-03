'use client';

// import type { PublicBioBlock } from '@barely/lib/functions/bio.fns';
import type { AppRouterOutputs } from '@barely/lib/trpc/app.route';
import React from 'react';
import { cn, getBrandKitRadiusClass, getComputedStyles } from '@barely/utils';

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
}

export function BioBlocksRender({ blocks }: BioBlocksRenderProps) {
	const { isPreview } = useBioContext();
	const brandKit = useBrandKit();

	const computedStyles = getComputedStyles(brandKit);
	const isFullWidthButtons = brandKit.blockStyle === 'full-width';

	return (
		<div
			className={cn(
				'flex flex-col gap-10 md:gap-12',
				// brandKit.blockShadow && 'gap-4',
				!isFullWidthButtons && '',
				isFullWidthButtons && '', // No horizontal padding for full-width buttons
			)}
		>
			{blocks.map((block, blockIndex) => {
				// Only render enabled blocks
				if (!block.enabled) return null;

				// Render different block types
				switch (block.type) {
					case 'links':
						return <LinksBlock key={block.id} block={block} blockIndex={blockIndex} />;

					case 'markdown':
						return <MarkdownBlock key={block.id} block={block} />;

					case 'image':
						return <ImageBlock key={block.id} block={block} blockIndex={blockIndex} />;

					case 'twoPanel':
						return <TwoPanelBlock key={block.id} block={block} blockIndex={blockIndex} />;

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

'use client';

import type { AppRouterOutputs } from '@barely/lib/trpc/app.route';
import React from 'react';
import { cn, getComputedStyles } from '@barely/utils';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

import { useBioContext } from '../contexts/bio-context';
import { useBrandKit } from '../contexts/brand-kit-context';
import { CtaButton } from './cta-button';
import { createMarkdownComponents, MarkdownBlockHeader } from './markdown-block-shared';

interface MarkdownBlockProps {
	block: AppRouterOutputs['bio']['blocksByHandleAndKey'][number];
}

/**
 * Client-side markdown block for real-time preview in the editor.
 * Uses react-markdown for instant rendering without compilation.
 */
export function MarkdownBlock({ block }: MarkdownBlockProps) {
	const brandKit = useBrandKit();
	const computedStyles = getComputedStyles(brandKit);
	const { isPreview, onTargetUrlClick } = useBioContext();

	const content = block.markdown ?? '';

	// Use our custom markdown components with brand kit styles
	// react-markdown can use these directly
	const markdownComponents = createMarkdownComponents(computedStyles);

	// Handle click on the markdown block in preview mode
	const handleBlockClick = (e: React.MouseEvent) => {
		if (isPreview && onTargetUrlClick) {
			// Only trigger if clicking on the block itself, not on a CTA button
			const target = e.target as HTMLElement;
			if (!target.closest('button') && !target.closest('a')) {
				void onTargetUrlClick('', {
					blockId: block.id,
					blockType: 'markdown',
					blockIndex: 0,
					linkIndex: 0,
				});
			}
		}
	};

	return (
		<div
			className={cn('space-y-4', isPreview && 'cursor-pointer')}
			onClick={handleBlockClick}
		>
			<MarkdownBlockHeader
				title={block.title}
				subtitle={block.subtitle}
				headingFont={computedStyles.fonts.headingFont}
				bodyFont={computedStyles.fonts.bodyFont}
			/>

			{/* Markdown content */}
			<div className={cn('prose prose-sm max-w-none', 'text-brandKit-text')}>
				<ReactMarkdown
					remarkPlugins={[remarkGfm, remarkBreaks]}
					rehypePlugins={[rehypeRaw]}
					components={markdownComponents}
				>
					{content}
				</ReactMarkdown>
			</div>

			{/* CTA Button */}
			{block.ctaText && (
				<div className='mt-4 flex justify-center'>
					<CtaButton block={block} />
				</div>
			)}
		</div>
	);
}

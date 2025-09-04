'use client';

import type { AppRouterOutputs } from '@barely/lib/trpc/app.route';
import React from 'react';
import { cn, getComputedStyles } from '@barely/utils';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import { useBrandKit } from '../contexts/brand-kit-context';
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

	const content = block.markdown ?? '';

	// Use our custom markdown components with brand kit styles
	// react-markdown can use these directly
	const markdownComponents = createMarkdownComponents(computedStyles);

	return (
		<div className='space-y-4'>
			<MarkdownBlockHeader
				title={block.title}
				subtitle={block.subtitle}
				headingFont={computedStyles.fonts.headingFont}
				bodyFont={computedStyles.fonts.bodyFont}
			/>

			{/* Markdown content */}
			<div className={cn('prose prose-sm max-w-none', 'text-brandKit-text')}>
				<ReactMarkdown
					remarkPlugins={[remarkGfm]}
					rehypePlugins={[rehypeRaw]}
					components={markdownComponents}
				>
					{content}
				</ReactMarkdown>
			</div>
		</div>
	);
}

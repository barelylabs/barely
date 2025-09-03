'use client';

import type { AppRouterOutputs } from '@barely/lib/trpc/app.route';
import React from 'react';
import { getComputedStyles } from '@barely/utils';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import { useBioContext } from '../contexts/bio-context';
import { useBrandKit } from '../contexts/brand-kit-context';
import { createMarkdownComponents } from './markdown-block-shared';
import { TwoPanelBlockShared } from './two-panel-block-shared';

interface TwoPanelBlockProps {
	block: AppRouterOutputs['bio']['blocksByHandleAndKey'][number];
	blockIndex: number;
}

/**
 * Client-side two-panel block for real-time preview in the editor.
 * Uses react-markdown for instant rendering without compilation.
 */
export function TwoPanelBlock({ block, blockIndex }: TwoPanelBlockProps) {
	const {
		bio,
		onTargetLinkClick,
		onTargetCartFunnelClick,
		onTargetFmClick,
		onTargetBioClick,
		onTargetUrlClick,
		isPreview,
		tracking,
	} = useBioContext();
	const brandKit = useBrandKit();
	const computedStyles = getComputedStyles(brandKit);

	// Use react-markdown for client-side rendering
	const markdownComponents = createMarkdownComponents(computedStyles);

	const markdownContent =
		block.markdown ?
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				rehypePlugins={[rehypeRaw]}
				components={markdownComponents}
			>
				{block.markdown}
			</ReactMarkdown>
		:	null;

	return (
		<TwoPanelBlockShared
			block={block}
			blockIndex={blockIndex}
			markdownContent={markdownContent}
			computedStyles={computedStyles}
			bio={bio}
			isPreview={isPreview}
			tracking={tracking}
			onTargetLinkClick={onTargetLinkClick}
			onTargetCartFunnelClick={onTargetCartFunnelClick}
			onTargetFmClick={onTargetFmClick}
			onTargetBioClick={onTargetBioClick}
			onTargetUrlClick={onTargetUrlClick}
		/>
	);
}

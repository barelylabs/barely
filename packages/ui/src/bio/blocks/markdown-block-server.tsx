import type { AppRouterOutputs } from '@barely/lib/trpc/app.route';
import type { BrandKit } from '@barely/validators';
import { cn, getComputedStyles } from '@barely/utils';

import { MDXRemoteRSC } from '../../elements/mdx-remote';
import { createMarkdownComponents, MarkdownBlockHeader } from './markdown-block-shared';

interface MarkdownBlockServerProps {
	block: AppRouterOutputs['bio']['blocksByHandleAndKey'][number];
	brandKit: BrandKit; // This will come from server context, not useBrandKit hook
}

/**
 * Server-side markdown block for public bio pages.
 * Uses MDXRemoteRSC for server-compiled MDX rendering.
 */
export async function MarkdownBlockServer({ block, brandKit }: MarkdownBlockServerProps) {
	const computedStyles = getComputedStyles(brandKit);
	const content = block.markdown ?? '';

	// Use our custom markdown components with brand kit styles
	const components = createMarkdownComponents(computedStyles);

	const renderedMarkdown = await MDXRemoteRSC({ source: content, components });

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
				{renderedMarkdown}
			</div>
		</div>
	);
}

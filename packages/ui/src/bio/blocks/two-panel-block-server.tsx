import type { AppRouterOutputs } from '@barely/lib/trpc/app.route';
import type { BrandKit } from '@barely/validators';
import { getComputedStyles } from '@barely/utils';

import { MDXRemoteRSC } from '../../elements/mdx-remote';
import { createMarkdownComponents } from './markdown-block-shared';
import { TwoPanelBlockShared } from './two-panel-block-shared';

interface TwoPanelBlockServerProps {
	block: AppRouterOutputs['bio']['blocksByHandleAndKey'][number];
	blockIndex: number;
	brandKit: BrandKit; // This will come from server context, not useBrandKit hook
	bio: {
		handle: string;
	};
	isPreview?: boolean;
	onTargetLinkClick?: (
		targetLink: NonNullable<
			AppRouterOutputs['bio']['blocksByHandleAndKey'][number]['targetLink']
		>,
		meta: {
			blockId: string;
			blockType: string;
			blockIndex: number;
			linkIndex: number;
			targetLinkId: string;
		},
	) => Promise<void>;
	onTargetCartFunnelClick?: (
		targetCartFunnel: NonNullable<
			AppRouterOutputs['bio']['blocksByHandleAndKey'][number]['targetCartFunnel']
		>,
		meta: {
			blockId: string;
			blockType: string;
			blockIndex: number;
			linkIndex: number;
			targetCartFunnelId: string;
		},
	) => Promise<void>;
	onTargetFmClick?: (
		targetFm: NonNullable<
			AppRouterOutputs['bio']['blocksByHandleAndKey'][number]['targetFm']
		>,
		meta: {
			blockId: string;
			blockType: string;
			blockIndex: number;
			linkIndex: number;
			targetFmId: string;
		},
	) => Promise<void>;
	onTargetBioClick?: (
		targetBio: NonNullable<
			AppRouterOutputs['bio']['blocksByHandleAndKey'][number]['targetBio']
		>,
		meta: {
			blockId: string;
			blockType: string;
			blockIndex: number;
			linkIndex: number;
			targetBioId: string;
		},
	) => Promise<void>;
	onTargetUrlClick?: (
		targetUrl: string,
		meta: {
			blockId: string;
			blockType: string;
			blockIndex: number;
			linkIndex: number;
			targetUrl: string;
		},
	) => Promise<void>;
}

/**
 * Server-side two-panel block for public bio pages.
 * Uses MDXRemoteRSC for server-compiled MDX rendering.
 */
export async function TwoPanelBlockServer({
	block,
	blockIndex,
	brandKit,
	bio,
	isPreview,
	onTargetLinkClick,
	onTargetCartFunnelClick,
	onTargetFmClick,
	onTargetBioClick,
	onTargetUrlClick,
}: TwoPanelBlockServerProps) {
	const computedStyles = getComputedStyles(brandKit);
	const content = block.markdown ?? '';

	// Use our custom markdown components with brand kit styles
	const components = createMarkdownComponents(computedStyles);

	const markdownContent =
		content ? await MDXRemoteRSC({ source: content, components }) : null;

	return (
		<TwoPanelBlockShared
			block={block}
			blockIndex={blockIndex}
			markdownContent={markdownContent}
			computedStyles={computedStyles}
			bio={bio}
			isPreview={isPreview}
			onTargetLinkClick={onTargetLinkClick}
			onTargetCartFunnelClick={onTargetCartFunnelClick}
			onTargetFmClick={onTargetFmClick}
			onTargetBioClick={onTargetBioClick}
			onTargetUrlClick={onTargetUrlClick}
		/>
	);
}

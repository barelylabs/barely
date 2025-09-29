import type { BioBlockType } from '@barely/const';
import type { AppRouterOutputs } from '@barely/lib/trpc/app.route';
import type { BrandKit } from '@barely/validators';
import type { BioTrackingData } from '@barely/validators/schemas';
import {
	cn,
	getAbsoluteUrl,
	getBrandKitButtonRadiusClass,
	getBrandKitOutlineClass,
	getComputedStyles,
	getTrackingEnrichedHref,
} from '@barely/utils';

import { Button } from '../../elements/button';

interface CtaButtonServerProps {
	block: AppRouterOutputs['bio']['blocksByHandleAndKey'][number];
	blockIndex: number;
	blockType: BioBlockType;
	brandKit: BrandKit;
	bio: {
		handle: string;
	};
	isPreview?: boolean;
	tracking?: BioTrackingData;
	className?: string;
}

export function CtaButtonServer({
	block,
	blockIndex: _blockIndex,
	blockType: _blockType,
	brandKit,
	bio,
	isPreview,
	tracking,
	className,
}: CtaButtonServerProps) {
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
			size='md'
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
		>
			{block.ctaText}
		</Button>
	);
}

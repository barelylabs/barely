import { cn, getComputedStyles } from '@barely/utils';

import { useBio } from './contexts/bio-context';
import { useBrandKit } from './contexts/brand-kit-context';

export function BioBranding({ isPreview }: { isPreview?: boolean }) {
	const { bio } = useBio();
	const brandKit = useBrandKit();
	const computedStyles = getComputedStyles(brandKit);

	if (!bio.barelyBranding) return null;

	return (
		<div
			className={cn(
				'mt-8 text-center',
				brandKit.blockStyle === 'full-width' && 'px-6 pb-6',
			)}
		>
			<a
				href={isPreview ? '#' : 'https://barely.ai'}
				target={isPreview ? undefined : '_blank'}
				rel={isPreview ? undefined : 'noopener noreferrer'}
				className={cn('text-xs opacity-50', isPreview && 'pointer-events-none')}
				style={{ color: computedStyles.colors.text }}
				onClick={isPreview ? (e: React.MouseEvent) => e.preventDefault() : undefined}
			>
				Powered by barely.ai
			</a>
		</div>
	);
}

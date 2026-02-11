import { mdxImageFile } from '@barely/ui/mdx-image-file';
import { mdxLink } from '@barely/ui/mdx-link';
import { MDXRemoteRSC as MDXRemote } from '@barely/ui/mdx-remote';
import { mdxVideoPlayer } from '@barely/ui/mdx-video-player';

import { BlogCtaCard } from './blog-cta-card';
import { blogTypography } from './blog-typography';
import { CalComBookingLink } from './cal-com-booking-link';
import { DiscoveryCtaCard, ResultsCtaCard, StrategyCtaCard } from './cta-card-variants';

export function BlogMDX({ markdown }: { markdown: string }) {
	const components = {
		...blogTypography,
		...mdxVideoPlayer,
		...mdxImageFile(),
		...mdxLink,
		CalComBookingLink,
		BlogCtaCard,
		StrategyCtaCard,
		ResultsCtaCard,
		DiscoveryCtaCard,
	};

	return (
		<article className='prose prose-invert max-w-none'>
			<MDXRemote source={markdown} components={components} />
		</article>
	);
}

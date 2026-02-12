import type { ComponentProps } from 'react';

import { BlogCtaCard } from './blog-cta-card';

type BlogCtaCardProps = ComponentProps<typeof BlogCtaCard>;

/**
 * Pre-configured CTA card variants for easy use in MDX blog posts
 *
 * Usage in MDX:
 * <StrategyCtaCard />
 * <ResultsCtaCard showCaseStudiesLink={true} />
 * <DiscoveryCtaCard headline="Custom Headline" />
 */

export function StrategyCtaCard(props: Omit<BlogCtaCardProps, 'variant'>) {
	return <BlogCtaCard variant='strategy' {...props} />;
}

export function ResultsCtaCard(props: Omit<BlogCtaCardProps, 'variant'>) {
	return <BlogCtaCard variant='results' {...props} />;
}

export function DiscoveryCtaCard(props: Omit<BlogCtaCardProps, 'variant'>) {
	return <BlogCtaCard variant='discovery' {...props} />;
}

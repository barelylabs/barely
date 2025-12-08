'use client';

import Link from 'next/link';

import { CalComBookingLink } from './cal-com-booking-link';

type CtaVariant = 'strategy' | 'results' | 'discovery';

interface BlogCtaCardProps {
	variant?: CtaVariant;
	headline?: string;
	showCaseStudiesLink?: boolean;
	className?: string;
}

const variantContent = {
	strategy: {
		headline: 'Ready to Apply This Strategy?',
		valueProps: [
			'30-minute strategy session tailored to your music',
			"We'll analyze your current setup ahead of time",
			'Get a custom implementation plan you can start today',
		],
		trustSignal: 'Free 30-minute session • Custom strategy plan • No commitment required',
	},
	results: {
		headline: 'Want Similar Results?',
		valueProps: [
			'See exactly how we grew artists like Proper Youth 335%',
			'Get a custom growth strategy for your current level',
			'30-minute session with detailed analysis prepared beforehand',
		],
		trustSignal: 'Free strategy session • Real results • Complete transparency',
	},
	discovery: {
		headline: 'See This Approach in Action',
		valueProps: [
			'Explore how the engineering approach applies to your music',
			'30-minute session analyzing your current marketing',
			'Get a data-driven strategy tailored to your goals',
		],
		trustSignal: 'Free consultation • No pitch • Just analysis',
	},
};

/**
 * Reusable CTA card for blog posts
 * Integrates with CalComBookingLink for dynamic URL prefilling
 *
 * Usage in MDX:
 * <BlogCtaCard variant="strategy" />
 * <BlogCtaCard variant="results" showCaseStudiesLink={true} />
 */
export function BlogCtaCard({
	variant = 'strategy',
	headline,
	showCaseStudiesLink = false,
	className = '',
}: BlogCtaCardProps) {
	const content = variantContent[variant];
	const displayHeadline = headline ?? content.headline;

	return (
		<div
			className={`glow-card-purple glass not-prose my-12 rounded-xl border border-white/10 p-8 ${className}`}
		>
			<div className='space-y-6'>
				{/* Headline */}
				<h3 className='text-center text-2xl font-bold text-white md:text-3xl'>
					{displayHeadline}
				</h3>

				{/* Value Props */}
				<ul className='mx-auto max-w-md space-y-3'>
					{content.valueProps.map((prop, index) => (
						<li key={index} className='flex items-start gap-3 text-white/80'>
							<span className='mt-1 text-purple-400'>✓</span>
							<span>{prop}</span>
						</li>
					))}
				</ul>

				{/* CTAs */}
				<div className='flex flex-col gap-4 sm:flex-row sm:justify-center'>
					<CalComBookingLink>
						<button className='w-full rounded-lg bg-gradient-to-r from-violet-600 to-pink-600 px-8 py-3 font-semibold text-white transition-all duration-300 hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] sm:w-auto'>
							Book Free Strategy Call
						</button>
					</CalComBookingLink>

					{showCaseStudiesLink && (
						<Link href='/case-studies'>
							<button className='w-full rounded-lg border-2 border-white/20 px-8 py-3 font-semibold text-white transition-all duration-300 hover:bg-white/10 sm:w-auto'>
								View Case Studies
							</button>
						</Link>
					)}
				</div>

				{/* Trust Signal */}
				<p className='text-center text-sm text-white/50'>{content.trustSignal}</p>
			</div>
		</div>
	);
}

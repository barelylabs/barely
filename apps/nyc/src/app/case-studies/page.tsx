import type { Metadata } from 'next';
import Link from 'next/link';

import { H } from '@barely/ui/typography';

import { AnimatedSection } from '~/components/marketing/animated-section';
import { CaseStudyCard } from '~/components/marketing/case-study-card';

import { allCaseStudies } from '~/data/case-studies';

export const metadata: Metadata = {
	title: 'Case Studies - Real Results from Real Artists | Barely',
	description:
		'See how independent artists grew their audiences with data-driven marketing strategies. Real numbers, real growth, complete transparency.',
};

// Get case studies with computed values for the card display
const caseStudies = allCaseStudies.map(study => {
	const beforeListeners = study.metrics.before.monthlyListeners;
	const afterListeners = study.metrics.after.monthlyListeners;
	const growthPercentage = Math.round(
		((afterListeners - beforeListeners) / beforeListeners) * 100,
	);
	const duration =
		study.timeline[study.timeline.length - 1]?.month ?? study.timeline.length + ' months';

	return {
		slug: study.id,
		artistName: study.artistName,
		genre: study.genre,
		serviceTier: study.serviceTier,
		beforeListeners,
		afterListeners,
		growthPercentage,
		timeframe: duration,
		avatarUrl: study.avatarUrl,
		merchRevenue: study.merchRevenue,
		summary: study.summary,
		featured: study.featured,
	};
});

// TODO: Re-enable when implementing filter functionality
// const genres = ['All', 'Electronic', 'Indie Rock', 'Folk', 'Hip-Hop', 'Dream Pop'];
// const tiers = ['All Tiers', 'Bedroom+', 'Rising+', 'Breakout+'];

export default function CaseStudiesPage() {
	return (
		<main className='pt-16'>
			{/* Hero Section */}
			<section className='px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl text-center'>
					<AnimatedSection animation='fade-up'>
						<H size='1' className='mb-6 font-heading text-5xl md:text-6xl lg:text-7xl'>
							Real Artists. <span className='gradient-text'>Real Numbers.</span> Real
							Growth.
						</H>
						<p className='text-xl text-white/70 md:text-2xl'>
							See exactly how independent artists grew their audiences with transparent,
							data-driven strategies. No fluff, just results.
						</p>
					</AnimatedSection>
				</div>
			</section>

			{/* Filter Section - TODO: Implement filtering functionality when we have more case studies */}
			{/* <section className='border-b border-white/10 px-4 py-8 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-7xl'>
					<AnimatedSection animation='fade-up'>
						<div className='flex flex-col justify-center gap-6 sm:flex-row'>
							<div>
								<label
									htmlFor='genre-filter'
									className='mb-2 block text-sm text-white/60'
								>
									Genre
								</label>
								<select
									id='genre-filter'
									className='rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white'
								>
									{genres.map(genre => (
										<option key={genre} value={genre}>
											{genre}
										</option>
									))}
								</select>
							</div>
							<div>
								<label htmlFor='tier-filter' className='mb-2 block text-sm text-white/60'>
									Service Tier
								</label>
								<select
									id='tier-filter'
									className='rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white'
								>
									{tiers.map(tier => (
										<option key={tier} value={tier}>
											{tier}
										</option>
									))}
								</select>
							</div>
						</div>
					</AnimatedSection>
				</div>
			</section> */}

			{/* Featured Case Studies */}
			<section className='px-4 py-16 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-7xl'>
					<AnimatedSection animation='fade-up'>
						<H size='3' className='mb-12 text-center text-3xl md:text-4xl'>
							Featured Success Stories
						</H>
					</AnimatedSection>

					<div className='mb-16 grid grid-cols-1 gap-8 lg:grid-cols-2'>
						{caseStudies
							.filter(study => study.featured)
							.map((study, index) => (
								<AnimatedSection
									key={study.slug}
									animation='fade-up'
									delay={200 + index * 100}
								>
									<Link href={`/case-studies/${study.slug}`}>
										<CaseStudyCard {...study} featured />
									</Link>
								</AnimatedSection>
							))}
					</div>
				</div>
			</section>

			{/* All Case Studies */}
			{/* <section className='bg-white/5 px-4 py-16 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-7xl'>
					<AnimatedSection animation='fade-up'>
						<H size='3' className='mb-12 text-center text-3xl md:text-4xl'>
							More Success Stories
						</H>
					</AnimatedSection>

					<div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
						{caseStudies
							.filter(study => !study.featured)
							.map((study, index) => (
								<AnimatedSection
									key={study.slug}
									animation='fade-up'
									delay={200 + index * 100}
								>
									<Link href={`/case-studies/${study.slug}`}>
										<CaseStudyCard {...study} />
									</Link>
								</AnimatedSection>
							))}
					</div>
				</div>
			</section> */}

			{/* CTA Section */}
			<section className='px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl text-center'>
					<AnimatedSection animation='scale'>
						<H size='2' className='mb-8 text-4xl md:text-5xl'>
							Ready to Write Your Success Story?
						</H>
						<p className='mb-12 text-xl text-white/70'>
							Join our artists who&apos;ve grown their audiences with transparent,
							data-driven strategies.
						</p>
						<div className='flex flex-col justify-center gap-6 px-4 sm:flex-row sm:px-0'>
							<Link href='/services' className='w-full sm:w-auto'>
								<button className='w-full rounded-lg bg-gradient-to-r from-violet-600 to-pink-600 px-8 py-3 font-semibold text-white transition-all duration-300 hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] sm:w-auto'>
									View Services
								</button>
							</Link>
							<a
								href='https://app.usemotion.com/meet/barely/discovery'
								target='_blank'
								rel='noopener noreferrer'
								className='w-full sm:w-auto'
							>
								<button className='w-full rounded-lg border-2 border-white/20 px-8 py-3 font-semibold text-white transition-all duration-300 hover:bg-white/10 sm:w-auto'>
									Book Free Strategy Call
								</button>
							</a>
						</div>
					</AnimatedSection>
				</div>
			</section>
		</main>
	);
}

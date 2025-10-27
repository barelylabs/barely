import type { Metadata } from 'next';
import Link from 'next/link';

import { H } from '@barely/ui/typography';

import { AnimatedSection } from '../../components/marketing/animated-section';
import { MarketingButton } from '../../components/marketing/button';
import { PhDBadge } from '../../components/marketing/trust-badges';
import { properYouthCase } from '../../data/case-studies';

export const metadata: Metadata = {
	title: 'About - Engineering the Indie Middle Class | Barely NYC',
	description:
		'Brooklyn-based music marketing engineers building transparent growth systems for indie artists. Founded by PhD scientist Adam Barito.',
};

export default function AboutPage() {
	return (
		<main className='pt-16'>
			{' '}
			{/* Offset for fixed navigation */}
			{/* Page Header */}
			<section className='px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl text-center'>
					<AnimatedSection animation='fade-up'>
						<H size='1' className='mb-6 font-heading text-5xl md:text-6xl lg:text-7xl'>
							We Science the Hell Out of Music Marketing
						</H>
						<p className='text-xl text-white/70 md:text-2xl'>
							Brooklyn-based music marketing engineers building transparent growth systems
							for indie artists worldwide
						</p>
						<div className='mt-6'>
							<PhDBadge className='mx-auto' />
						</div>
					</AnimatedSection>
				</div>
			</section>
			{/* Content Sections */}
			<section className='px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl space-y-16'>
					{/* What We Do */}
					<AnimatedSection animation='fade-up'>
						<div className='space-y-6'>
							<H size='3' className='gradient-text text-3xl md:text-4xl'>
								Music Marketing, Actually Explained
							</H>
							<p className='text-lg leading-relaxed text-white/80'>
								Most music marketing agencies charge thousands while hiding exactly how
								they work. We do the opposite.
							</p>
							<p className='text-lg leading-relaxed text-white/80'>
								Barely NYC applies engineering principles to artist growth - controlled
								experiments, attribution modeling, real-time optimization. Every campaign
								is transparent. Every strategy is data-driven. Every dollar is tracked.
							</p>
							<p className='text-xl font-semibold text-white'>
								We&apos;re not a traditional agency. We&apos;re music marketing engineers.
							</p>
						</div>
					</AnimatedSection>

					{/* Origin Story */}
					<AnimatedSection animation='fade-up' delay={200}>
						<div className='space-y-6'>
							<H size='3' className='gradient-text text-3xl md:text-4xl'>
								From PhD to Brooklyn Studio
							</H>
							<p className='text-lg leading-relaxed text-white/80'>
								Barely NYC was founded by Adam Barito, a materials scientist who spent
								years optimizing molecules in research labs. PhD from University of
								Michigan. Double major in Physics and Mechanical Engineering. Research
								Fellow at NIST. VP of Engineering at a clean energy startup.
							</p>
							<p className='text-lg leading-relaxed text-white/80'>
								He thought he&apos;d spend his career perfecting atomic structures.
							</p>
							<p className='text-lg leading-relaxed text-white/80'>
								But Adam had a problem.
							</p>
							<p className='text-lg leading-relaxed text-white/80'>
								He was also a musician. And his albums got <em>tens</em> of listeners. Not
								thousands. Tens.
							</p>
							<p className='text-xl font-semibold text-white md:text-2xl'>
								The turning point came in 2020.
							</p>
							<p className='text-lg leading-relaxed text-white/80'>
								Adam applied his engineering training to marketing{' '}
								{properYouthCase.artistName}
								&apos;s debut album &quot;So Close to Paradise.&quot; The hit single
								&quot;Off My Mind&quot; went on to gain 1.8M streams - not because the
								music suddenly got better, but because he finally understood how to
								optimize the system around it.
							</p>
							<p className='text-lg leading-relaxed text-white/80'>
								Word spread. Every artist who reached out had been burned by the same
								expensive failures - playlist pitching services, publicists who delivered
								nothing, pay-for-play schemes, fake streams. They&apos;d spent thousands
								with nothing to show for it.
							</p>
							<p className='text-lg leading-relaxed text-white/80'>
								By 2022, Adam realized he was more excited about fixing music marketing
								than working on materials. The problem was the same - incredible potential
								getting lost in inefficient systems. The difference? In music, no one was
								applying engineering principles to solve it.
							</p>
							<p className='mb-6 text-xl font-semibold text-white md:text-2xl'>
								So he left his VP role to science the hell out of music marketing.
							</p>
						</div>
					</AnimatedSection>

					{/* Building barely.ai */}
					<AnimatedSection animation='fade-up' delay={400}>
						<div className='space-y-6'>
							<H size='3' className='gradient-text text-3xl md:text-4xl'>
								Open Source. By Design.
							</H>
							<p className='text-lg leading-relaxed text-white/80'>
								Instead of building another black-box dashboard, Adam built barely.ai
								completely open-source. Artists can see exactly how everything works - the
								code, the strategies, the attribution models.
							</p>
							<p className='text-lg leading-relaxed text-white/80'>
								Every campaign is treated like a controlled experiment. Every assumption
								gets tested. Every result gets measured.
							</p>
							<p className='text-xl font-semibold text-white'>
								This isn&apos;t feel-good marketing advice. It&apos;s engineering.
							</p>
						</div>
					</AnimatedSection>

					{/* Brooklyn Base */}
					<AnimatedSection animation='fade-up' delay={600}>
						<div className='space-y-6'>
							<H size='3' className='gradient-text text-3xl md:text-4xl'>
								Building From Brooklyn
							</H>
							<p className='text-lg leading-relaxed text-white/80'>
								In 2023, Barely NYC set up shop in Brooklyn - where music and technology
								collide, where the indie spirit drives innovation.
							</p>
							<p className='text-lg leading-relaxed text-white/80'>
								While the agency is based in New York, the artists we work with are
								everywhere: LA, Nashville, Cleveland, South Wales, Paris. Our data-driven
								approach translates across time zones and genres.
							</p>
							<p className='text-xl font-semibold text-white'>
								Good science is universal.
							</p>
						</div>
					</AnimatedSection>

					{/* How We're Different */}
					<AnimatedSection animation='fade-up' delay={800}>
						<div className='space-y-6'>
							<H size='3' className='gradient-text text-3xl md:text-4xl'>
								Transparency Over Mystique
							</H>
							<p className='text-lg leading-relaxed text-white/80'>
								The music industry loves mystique. Secret playlists. Industry connections.
								&quot;Trust us, it just works.&quot;
							</p>
							<p className='text-lg leading-relaxed text-white/80'>
								We take the opposite approach:
							</p>
							<ul className='space-y-3 text-lg text-white/80'>
								<li className='flex items-start gap-3'>
									<span className='mt-0.5 text-green-500'>✓</span>
									<span>
										<strong>Open-source platform</strong> - See exactly how campaigns
										operate
									</span>
								</li>
								<li className='flex items-start gap-3'>
									<span className='mt-0.5 text-green-500'>✓</span>
									<span>
										<strong>Real attribution modeling</strong> - Know what&apos;s actually
										driving growth
									</span>
								</li>
								<li className='flex items-start gap-3'>
									<span className='mt-0.5 text-green-500'>✓</span>
									<span>
										<strong>Honest reporting</strong> - No inflated metrics or fake
										guarantees
									</span>
								</li>
								<li className='flex items-start gap-3'>
									<span className='mt-0.5 text-green-500'>✓</span>
									<span>
										<strong>Scientific method</strong> - Hypothesis → Test → Measure →
										Optimize
									</span>
								</li>
								<li className='flex items-start gap-3'>
									<span className='mt-0.5 text-green-500'>✓</span>
									<span>
										<strong>Educational approach</strong> - Understand the &quot;why&quot;
										behind every strategy
									</span>
								</li>
							</ul>
							<p className='text-xl font-semibold text-white'>
								We show our work. Always.
							</p>
						</div>
					</AnimatedSection>

					{/* The Vision */}
					<AnimatedSection animation='fade-up' delay={1000}>
						<div className='space-y-6'>
							<H size='3' className='gradient-text text-3xl md:text-4xl'>
								Building the Indie Middle Class (The Honest Timeline)
							</H>
							<p className='text-lg leading-relaxed text-white/80'>
								What does success look like for an indie artist? Real income from music -
								enough to eventually quit the day job.
							</p>
							<p className='text-xl font-semibold text-white md:text-2xl'>
								But here&apos;s the reality most agencies won&apos;t tell you: Year 1 is
								about building your customer base, not getting rich.
							</p>
							<p className='text-lg leading-relaxed text-white/80'>
								Take {properYouthCase.artistName} as an example.{' '}
								{properYouthCase.featuredHighlights?.monthlyRevenue?.description}{' '}
								{properYouthCase.featuredHighlights?.monthlyRevenue?.timeline} - but that
								required $3k/month in ad spend toward sales campaigns. Roughly break-even,
								maybe slight losses when you factor in all costs.
							</p>
							<p className='text-lg leading-relaxed text-white/80'>
								But here&apos;s what matters: they now have a base of paying fans. Real
								customers who&apos;ve already bought once and can be marketed to again.
								That&apos;s when the economics flip.
							</p>
							<p className='text-xl font-semibold text-white md:text-2xl'>
								Our 2026 goal: $1M in combined client sales revenue and 20M streams.
							</p>
							<p className='text-lg leading-relaxed text-white/80'>
								That&apos;s not about 20 artists quitting their jobs Year 1. It&apos;s
								about building the foundation for 20 artists to own their future by Year
								2.
							</p>
							<p className='text-lg leading-relaxed text-white/80'>
								No fake promises. No overnight success. Just transparent methods that
								compound over time.
							</p>
							<div className='glass rounded-xl p-6'>
								<p className='mb-2 text-lg font-semibold text-white'>
									Year 1: Build your customer base (likely break-even)
								</p>
								<p className='mb-2 text-lg font-semibold text-white'>
									Year 2: Build your income (that&apos;s where profitability happens)
								</p>
								<p className='text-lg font-semibold text-white'>
									Year 3+: Build your career (sustainable independence)
								</p>
							</div>
							<p className='text-xl font-semibold text-white'>
								That&apos;s the indie middle class we&apos;re engineering.
							</p>
						</div>
					</AnimatedSection>
				</div>
			</section>
			{/* CTA Section */}
			<section className='bg-white/5 px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl text-center'>
					<AnimatedSection animation='scale'>
						<H size='2' className='mb-8 text-4xl md:text-5xl'>
							Ready to science the hell out of your music marketing?
						</H>
						<div className='flex flex-col justify-center gap-6 sm:flex-row'>
							<Link href='/services'>
								<MarketingButton
									marketingLook='hero-primary'
									size='lg'
									className='min-w-[200px]'
								>
									See Our Services
								</MarketingButton>
							</Link>
							<a href='https://barely.ai' target='_blank' rel='noopener noreferrer'>
								<MarketingButton
									marketingLook='scientific'
									size='lg'
									className='min-w-[200px]'
								>
									Try barely.ai Tools
								</MarketingButton>
							</a>
						</div>
					</AnimatedSection>
				</div>
			</section>
		</main>
	);
}

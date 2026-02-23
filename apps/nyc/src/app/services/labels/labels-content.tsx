'use client';

import { H } from '@barely/ui/typography';

import { AnimatedSection } from '../../../components/marketing/animated-section';
import { MarketingButton } from '../../../components/marketing/button';

const LABEL_CAL_URL = 'https://cal.com/barely/nyc';

export function LabelsContent() {
	return (
		<main className='pt-16'>
			{/* Hero */}
			<section className='px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl text-center'>
					<AnimatedSection animation='fade-up'>
						<H
							size='1'
							className='mb-6 font-heading text-5xl md:text-6xl lg:text-7xl'
						>
							Labels & Distributors
						</H>
						<p className='text-xl text-white/70 md:text-2xl'>
							Roster-level marketing engineering for labels and distributors who need
							more than a campaign vendor.
						</p>
					</AnimatedSection>
				</div>
			</section>

			{/* Body Copy */}
			<section className='px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<div className='glass rounded-2xl p-8'>
							<div className='space-y-6 text-lg leading-relaxed text-white/80'>
								<p>
									Individual artist campaigns are what we&apos;re known for. But some of
									our most interesting work happens at the roster level — building shared
									infrastructure, sequencing releases strategically, and helping labels
									think about marketing as a system rather than a series of one-off
									pushes.
								</p>
								<p>
									We work with labels and distributors who want a single, reliable
									partner across their roster. Someone who understands label economics,
									knows how to prioritize limited budgets across artists at different
									stages, and can zoom out from any individual campaign to ask
									what&apos;s actually moving the needle for the label as a whole.
								</p>
							</div>
						</div>
					</AnimatedSection>
				</div>
			</section>

			{/* What That Looks Like in Practice */}
			<section className='px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-6 text-3xl md:text-4xl'>
							What that looks like in practice
						</H>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={200}>
						<p className='text-lg leading-relaxed text-white/80'>
							Working with us at the roster level can mean anything from managing a
							single priority artist campaign on behalf of the label, to building a
							label-wide marketing architecture — shared playlist assets, release
							sequencing, owned audience strategy — with ongoing strategic input as your
							roster grows. We structure these engagements around what you actually need,
							not a fixed package.
						</p>
					</AnimatedSection>
				</div>
			</section>

			{/* Who This Is For */}
			<section className='px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-8 text-3xl md:text-4xl'>
							Who this is for
						</H>
					</AnimatedSection>

					<div className='space-y-6'>
						<AnimatedSection animation='fade-up' delay={200}>
							<div className='glass rounded-xl p-6 transition-all hover:border-purple-500/30'>
								<div className='flex items-start gap-4'>
									<span className='mt-0.5 text-green-500'>✓</span>
									<p className='text-lg text-white/80'>
										Independent labels with coherent rosters and a serious commitment to
										their artists&apos; long-term careers
									</p>
								</div>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={300}>
							<div className='glass rounded-xl p-6 transition-all hover:border-purple-500/30'>
								<div className='flex items-start gap-4'>
									<span className='mt-0.5 text-green-500'>✓</span>
									<p className='text-lg text-white/80'>
										Distributors looking for a trusted marketing partner to refer or
										white-label services to their artist base
									</p>
								</div>
							</div>
						</AnimatedSection>
					</div>
				</div>
			</section>

			{/* Pricing */}
			<section className='px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-6 text-3xl md:text-4xl'>
							Pricing
						</H>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={200}>
						<div className='glass rounded-2xl p-8'>
							<p className='text-lg leading-relaxed text-white/80'>
								Label and roster engagements are structured in two layers. Individual
								artist campaigns are available at our standard rates, with volume
								arrangements for ongoing roster work. Roster-wide strategy, release
								planning, and program management is a separate engagement priced based
								on roster scope and complexity — book a call to talk through what makes
								sense for your situation.
							</p>
						</div>
					</AnimatedSection>
				</div>
			</section>

			{/* CTA */}
			<section className='px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-md text-center'>
					<AnimatedSection animation='scale'>
						<a href={LABEL_CAL_URL} target='_blank' rel='noopener noreferrer'>
							<MarketingButton
								marketingLook='hero-primary'
								size='lg'
								fullWidth
								className='group'
							>
								<span className='flex items-center justify-center gap-2'>
									Book a label strategy call →
								</span>
							</MarketingButton>
						</a>
					</AnimatedSection>
				</div>
			</section>
		</main>
	);
}

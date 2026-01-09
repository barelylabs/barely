'use client';

import Link from 'next/link';
import { NYC_BEDROOM_PLUS } from '@barely/const';

import { H } from '@barely/ui/typography';

import { AnimatedSection } from '../../../components/marketing/animated-section';
import { MarketingButton } from '../../../components/marketing/button';
import { PricingCard } from '../../../components/marketing/pricing-card';
import { useContactModal } from '../../../contexts/contact-modal-context';

export function BedroomContent() {
	const { open: openContactModal } = useContactModal();
	return (
		<main className='pt-16'>
			{/* Page Header */}
			<section className='px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl text-center'>
					<AnimatedSection animation='fade-up'>
						<div className='mb-4 space-y-1'>
							<span className='block text-sm font-medium text-purple-300'>
								First Month Special
							</span>
							<div className='flex items-center justify-center gap-2'>
								<span className='text-2xl text-white/40 line-through'>
									${NYC_BEDROOM_PLUS.price.monthly.amount}
								</span>
								<span className='text-xl font-semibold text-purple-300 md:text-2xl'>
									${NYC_BEDROOM_PLUS.promotionalPrice?.firstMonth}/month
								</span>
							</div>
						</div>
						<H
							size='1'
							className='gradient-text mb-6 font-heading text-5xl md:text-6xl lg:text-7xl'
						>
							Bedroom+
						</H>
						<p className='mb-4 text-2xl text-white md:text-3xl'>
							Learn the Scientific Method for Music Marketing
						</p>
						<p className='text-lg text-white/70'>
							Perfect for artists with 0-10K monthly listeners • Bi-weekly coaching +
							barely.ai tools
						</p>
					</AnimatedSection>
				</div>
			</section>

			{/* Intro Section */}
			<section className='px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<div className='glass mb-12 rounded-2xl p-8'>
							<H size='3' className='mb-6 text-2xl md:text-3xl'>
								For Artists Who Want to Understand the &quot;Why&quot;
							</H>
							<p className='mb-4 text-lg leading-relaxed text-white/80'>
								Most music marketing feels like throwing darts blindfolded. You spend
								money on ads, submit to playlists, post on social media... but you never
								really know what&apos;s working or why.
							</p>
							<p className='text-xl font-semibold text-white'>Bedroom+ changes that.</p>
						</div>
					</AnimatedSection>
				</div>
			</section>

			{/* What You Get */}
			<section className='px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-6xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-12 text-center text-3xl md:text-4xl'>
							What You Get
						</H>
					</AnimatedSection>

					<div className='space-y-8'>
						<AnimatedSection animation='fade-up' delay={200}>
							<div className='glass rounded-xl p-6'>
								<div className='flex items-start gap-4'>
									<span className='text-3xl'>🎯</span>
									<div>
										<H size='5' className='mb-2'>
											Bi-Weekly Strategy Sessions (30 minutes)
										</H>
										<p className='text-white/70'>
											Direct access to music marketing engineers who treat your career
											like a research project. From our Brooklyn HQ, we work with artists
											globally - forming hypotheses, designing tests, and measuring
											results scientifically.
										</p>
									</div>
								</div>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={300}>
							<div className='glass rounded-xl p-6'>
								<div className='flex items-start gap-4'>
									<span className='text-3xl'>🛠️</span>
									<div>
										<H size='5' className='mb-2'>
											Full Access to barely.ai Tools (Bedroom Tier Included)
										</H>
										<p className='text-white/70'>
											Smart links, landing pages, email automation, and analytics - all
											the technical infrastructure you need, included free. Plus, since
											it&apos;s open-source, you can see exactly how everything works.
										</p>
									</div>
								</div>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={400}>
							<div className='glass rounded-xl p-6'>
								<div className='flex items-start gap-4'>
									<span className='text-3xl'>🛒</span>
									<div>
										<H size='5' className='mb-2'>
											Integrated Merch Platform + Strategy
										</H>
										<p className='text-white/70'>
											Direct-to-fan sales through barely.ai&apos;s built-in store.
											We&apos;ll coach you on optimizing physical sales that can return
											50-90% immediately (vs. 2% for streaming campaigns).
										</p>
									</div>
								</div>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={500}>
							<div className='glass rounded-xl p-6'>
								<div className='flex items-start gap-4'>
									<span className='text-3xl'>📋</span>
									<div>
										<H size='5' className='mb-2'>
											Custom Monthly Campaign Blueprints
										</H>
										<p className='text-white/70'>
											Based on your data and goals, you&apos;ll get detailed, step-by-step
											plans for your next campaigns. No generic advice - everything
											tailored to your numbers and your audience.
										</p>
									</div>
								</div>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={600}>
							<div className='glass rounded-xl p-6'>
								<div className='flex items-start gap-4'>
									<span className='text-3xl'>💬</span>
									<div>
										<H size='5' className='mb-2'>
											Direct Email Support
										</H>
										<p className='text-white/70'>
											Quick questions about optimization, technical setup, or strategy?
											Get answers from someone who actually built the tools.
										</p>
									</div>
								</div>
							</div>
						</AnimatedSection>
					</div>
				</div>
			</section>

			{/* The Process */}
			<section className='bg-white/5 px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-12 text-center text-3xl md:text-4xl'>
							The Process: Hypothesis → Test → Measure → Optimize
						</H>
					</AnimatedSection>

					<div className='space-y-6'>
						<AnimatedSection animation='slide-right' delay={200}>
							<div className='flex gap-4'>
								<div className='w-24 flex-shrink-0 font-bold text-purple-300'>
									Session 1:
								</div>
								<p className='text-white/80'>
									We analyze your current situation and form hypotheses about what will
									drive growth
								</p>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='slide-right' delay={300}>
							<div className='flex gap-4'>
								<div className='w-24 flex-shrink-0 font-bold text-purple-300'>
									Weeks 1-2:
								</div>
								<p className='text-white/80'>
									You execute the test campaign using your blueprint
								</p>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='slide-right' delay={400}>
							<div className='flex gap-4'>
								<div className='w-24 flex-shrink-0 font-bold text-purple-300'>
									Session 2:
								</div>
								<p className='text-white/80'>
									We review the data, learn from results, and design the next experiment
								</p>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='slide-right' delay={500}>
							<div className='flex gap-4'>
								<div className='w-24 flex-shrink-0 font-bold text-purple-300'>
									Repeat:
								</div>
								<p className='text-white/80'>
									Each cycle builds on the last, creating compound growth over time
								</p>
							</div>
						</AnimatedSection>
					</div>
				</div>
			</section>

			{/* Perfect For / Not Right For */}
			<section className='px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-6xl'>
					<div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
						<AnimatedSection animation='slide-right'>
							<div className='glass rounded-xl border-green-500/20 p-8'>
								<H size='4' className='mb-6 text-green-500'>
									Perfect For:
								</H>
								<ul className='space-y-3'>
									<li className='flex items-start gap-3'>
										<span className='mt-0.5 text-green-500'>✓</span>
										<span className='text-white/80'>
											Artists who want to learn sustainable marketing skills
										</span>
									</li>
									<li className='flex items-start gap-3'>
										<span className='mt-0.5 text-green-500'>✓</span>
										<span className='text-white/80'>
											Musicians tired of black-box services that hide their methods
										</span>
									</li>
									<li className='flex items-start gap-3'>
										<span className='mt-0.5 text-green-500'>✓</span>
										<span className='text-white/80'>
											DIY artists ready to apply scientific thinking to their careers
										</span>
									</li>
									<li className='flex items-start gap-3'>
										<span className='mt-0.5 text-green-500'>✓</span>
										<span className='text-white/80'>
											Anyone who values understanding the &quot;why&quot; behind every
											strategy
										</span>
									</li>
								</ul>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='slide-left'>
							<div className='glass rounded-xl border-red-500/20 p-8'>
								<H size='4' className='mb-6 text-red-500'>
									Not Right For:
								</H>
								<ul className='space-y-3'>
									<li className='flex items-start gap-3'>
										<span className='mt-0.5 text-red-500'>✗</span>
										<span className='text-white/80'>
											Artists who want someone else to handle everything (see Rising+ or
											Breakout+)
										</span>
									</li>
									<li className='flex items-start gap-3'>
										<span className='mt-0.5 text-red-500'>✗</span>
										<span className='text-white/80'>
											Musicians looking for guaranteed streaming numbers (we don&apos;t
											make false promises)
										</span>
									</li>
									<li className='flex items-start gap-3'>
										<span className='mt-0.5 text-red-500'>✗</span>
										<span className='text-white/80'>
											Artists who want to grow through networking and industry
											relationships rather than paid marketing and data
										</span>
									</li>
									<li className='flex items-start gap-3'>
										<span className='mt-0.5 text-red-500'>✗</span>
										<span className='text-white/80'>
											Artists looking for get-big-quick schemes. DIY marketing takes time
											and consistent effort.
										</span>
									</li>
								</ul>
							</div>
						</AnimatedSection>
					</div>
				</div>
			</section>

			{/* Pricing CTA */}
			<section className='px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-md'>
					<AnimatedSection animation='scale'>
						<PricingCard
							title={NYC_BEDROOM_PLUS.name}
							price={`$${NYC_BEDROOM_PLUS.promotionalPrice?.firstMonth}`}
							originalPrice={`$${NYC_BEDROOM_PLUS.price.monthly.amount}`}
							description={NYC_BEDROOM_PLUS.marketingDescription ?? ''}
							features={[
								'Bi-weekly 30-minute strategy sessions',
								'Full access to barely.ai tools (Bedroom tier)',
								'Custom monthly campaign blueprints',
								'Integrated merch platform + strategy',
								'Direct email support',
							]}
							ctaText='Get Started'
							onCTAClick={openContactModal}
						/>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={200}>
						<div className='mt-8 text-center'>
							<p className='mb-4 text-white/60'>Or explore other options:</p>
							<div className='flex justify-center gap-4'>
								<Link href='/services'>
									<MarketingButton marketingLook='glass' size='sm'>
										View All Services
									</MarketingButton>
								</Link>
								<MarketingButton
									marketingLook='scientific'
									size='sm'
									onClick={openContactModal}
								>
									Get Started
								</MarketingButton>
							</div>
						</div>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={300}>
						<div className='mt-12 rounded-xl border border-purple-500/20 bg-white/5 p-6 text-center'>
							<p className='text-white/80'>
								<span className='font-semibold text-purple-300'>Ready to scale?</span>{' '}
								When you&apos;re ready to hand off execution and scale your ad budget,{' '}
								<Link
									href='/services/rising'
									className='text-purple-300 underline hover:text-purple-200'
								>
									Rising+
								</Link>{' '}
								picks up where Bedroom+ leaves off.
							</p>
						</div>
					</AnimatedSection>
				</div>
			</section>
		</main>
	);
}
